# Fix GitHub device authorization

## Goal
Make one GitHub approval reliably continue the original blog action without generating repeated codes or confusing the visible user code with GitHub's private device credential.

## Changes
- Return an encrypted, opaque authorization request from `start_github_authorization`; never expose the raw GitHub device credential to the assistant.
- Make `complete_github_authorization` accept that opaque request, validate its expiry and purpose, and exchange the correct stored credential.
- Treat “still pending” as retryable with the same request, with explicit instructions never to restart authorization unless it expired or GitHub rejected it.
- Tighten the MCP server instructions and `/mcp` guide around the one-code continuous flow.
- Add focused tests for opaque request sealing, successful completion, pending approval, and invalid/expired handles.
- Deploy and validate the authoring endpoint after the build passes.

## Technical details
The visible code remains only for the owner to enter on GitHub. The private `device_code` is encrypted server-side into a short-lived `authorization_request`. The completion tool decrypts it and returns the existing one-hour `owner_session` only after confirming the GitHub account is `somritdasgupta`.
