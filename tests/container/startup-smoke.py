"""Run against a built image. Creates isolated containers; stops but never removes them."""
import argparse
import json
import subprocess
import time
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--engine', default='podman', choices=['podman', 'docker'])
parser.add_argument('--image', default='localhost/edupay:task041')
args = parser.parse_args()
prefix = 'edupay-startup-' + uuid.uuid4().hex[:8]
created = []


def run(*argv, check=True):
    result = subprocess.run([args.engine, *argv], capture_output=True, text=True, timeout=90)
    if check and result.returncode:
        raise AssertionError(f'Container command failed: {argv[0]} (exit {result.returncode})')
    return result.stdout.strip()


def state(name):
    return json.loads(run('inspect', name))[0]['State']


def wait_until(check, seconds=60):
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        if check():
            return
        time.sleep(0.3)
    raise AssertionError('Timed out waiting for expected state')


network = prefix + '-net'
db = prefix + '-db'
app = prefix + '-app'
bad = prefix + '-bad'
env = 'DATABASE_URL=postgresql://edupay:qa_only_startup@db:5432/edupay'
try:
    run('network', 'create', network)
    run('create', '--name', db, '--network', network, '--network-alias', 'db',
        '-e', 'POSTGRES_USER=edupay', '-e', 'POSTGRES_PASSWORD=qa_only_startup',
        '-e', 'POSTGRES_DB=edupay', 'docker.io/library/postgres:18')
    created.append(db)
    run('run', '-d', '--name', app, '--network', network, '-e', env, args.image)
    created.append(app)
    wait_until(lambda: 'Waiting for database readiness' in run('logs', app))
    assert 'Ready in' not in run('logs', app), 'Server started before DB'
    assert state(app)['Running']
    run('start', db)
    wait_until(lambda: 'Ready in' in run('logs', app))
    assert 'All migrations have been successfully applied' in run('logs', app)
    # Query real production HTTP inside the isolated app network.
    check_http = "const r=await fetch('http://127.0.0.1:3000/api/students');if(r.status!==200||(await r.json()).data.length!==0)process.exit(1)"
    run('exec', app, 'node', '--input-type=module', '-e', check_http)
    command = run('exec', app, 'sh', '-c', 'cat /proc/1/comm').strip()
    assert command == 'node' or command.startswith('next-server'), command
    run('stop', '--time', '10', app)
    assert state(app)['ExitCode'] != 137, 'Server needed SIGKILL'
    run('start', app)
    wait_until(lambda: 'No pending migrations to apply' in run('logs', app))
    wait_until(lambda: run('logs', app).count('Ready in') >= 2)
    run('exec', app, 'node', '--input-type=module', '-e', check_http)
    # The intentionally invalid migration exists only in this disposable container.
    command = "mkdir -p prisma/migrations/999999999999_bad; printf 'INVALID SQL;' > prisma/migrations/999999999999_bad/migration.sql; exec sh /app/docker/entrypoint.sh"
    run('run', '-d', '--name', bad, '--network', network, '-e', env,
        '--entrypoint', 'sh', args.image, '-c', command)
    created.append(bad)
    wait_until(lambda: not state(bad)['Running'])
    assert state(bad)['ExitCode'] != 0
    assert 'Ready in' not in run('logs', bad)
    print('PASS: delayed DB, fresh deploy, production HTTP, repeat deploy, signal shutdown, failed migration blocks server.')
finally:
    for name in reversed(created):
        run('stop', '--time', '10', name, check=False)
    print('Retained stopped QA containers: ' + ', '.join(created))
    print('Retained network: ' + network)
