# Secrets Rotation Playbook

## Rotate DB Credentials
1. Create new DB user/password with same privileges.
2. Update secret store and deployment env.
3. Restart API with new credentials.
4. Verify health and active traffic.
5. Revoke old DB credentials.

## Rotate JWT Signing Key
1. Introduce new key as active key in env.
2. Shorten access token TTL temporarily.
3. Force refresh/session revocation wave if compromise suspected.
4. Restart API instances gradually.
5. Confirm old tokens rejected after TTL.

## Rotate Redis Password
1. Set `requirepass` on Redis with planned window.
2. Update app env and restart API.
3. Validate lock/idempotency traffic.
4. Remove old password.
