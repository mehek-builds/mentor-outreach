export default function SetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-8 py-12 font-sans text-ink">
      <h1 className="mb-1 text-2xl font-semibold">Gmail Setup</h1>
      <p className="mb-8 text-sm text-muted">
        One-time setup to wire mehekmandal05@gmail.com for sending. Takes about 10 minutes.
      </p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="mb-3 font-semibold text-ink">Step 1 - Create a Google Cloud project</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>Go to <strong>console.cloud.google.com</strong> and sign in as mehekmandal05@gmail.com</li>
            <li>Click <strong>New Project</strong>, name it <code className="rounded bg-surface-alt px-1">mentor-outreach</code>, create it</li>
            <li>In the left menu, go to <strong>APIs and Services &gt; Library</strong></li>
            <li>Search for <strong>Gmail API</strong> and click Enable</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-ink">Step 2 - Create OAuth credentials</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>Go to <strong>APIs and Services &gt; OAuth consent screen</strong></li>
            <li>Select <strong>External</strong>, fill in App name (Mentor Outreach), your email for all fields, Save</li>
            <li>On the Scopes step, add <code className="rounded bg-surface-alt px-1">https://www.googleapis.com/auth/gmail.send</code> and <code className="rounded bg-surface-alt px-1">https://www.googleapis.com/auth/gmail.readonly</code></li>
            <li>Add mehekmandal05@gmail.com as a test user</li>
            <li>Go to <strong>Credentials &gt; Create Credentials &gt; OAuth client ID</strong></li>
            <li>Application type: <strong>Web application</strong></li>
            <li>Add Authorized redirect URI: <code className="rounded bg-surface-alt px-1">https://developers.google.com/oauthplayground</code></li>
            <li>Create - copy the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-ink">Step 3 - Get a Refresh Token</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>Go to <strong>developers.google.com/oauthplayground</strong></li>
            <li>Click the gear icon (top right), check <strong>Use your own OAuth credentials</strong></li>
            <li>Enter your Client ID and Client Secret</li>
            <li>In Step 1 on the left, paste and select these scopes:
              <br /><code className="mt-1 block rounded bg-surface-alt p-2 text-xs">
                https://www.googleapis.com/auth/gmail.send<br />
                https://www.googleapis.com/auth/gmail.readonly
              </code>
            </li>
            <li>Click <strong>Authorize APIs</strong>, sign in as mehekmandal05@gmail.com</li>
            <li>Click <strong>Exchange authorization code for tokens</strong></li>
            <li>Copy the <strong>Refresh token</strong></li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-ink">Step 4 - Add to Vercel</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>Go to <strong>vercel.com/mehek-builds-projects/mentor-outreach/settings/environment-variables</strong></li>
            <li>Add these three variables for Production:
              <div className="mt-2 space-y-1 rounded border border-border bg-surface-alt p-3 font-mono text-xs">
                <div><span className="text-brand">GMAIL_CLIENT_ID</span> = your client ID</div>
                <div><span className="text-brand">GMAIL_CLIENT_SECRET</span> = your client secret</div>
                <div><span className="text-brand">GMAIL_REFRESH_TOKEN</span> = your refresh token</div>
              </div>
            </li>
            <li>Redeploy the project (Deployments tab, three dots, Redeploy)</li>
            <li>Come back to the dashboard - the Gmail warning will be gone and Approve and Send will work</li>
          </ol>
        </section>

        <div className="rounded border border-positive/30 bg-positive/5 px-4 py-3 text-positive">
          Once the three env vars are set and the project is redeployed, every Approve and Send button on the main dashboard sends the email directly from mehekmandal05@gmail.com and logs the Gmail thread ID for reply tracking.
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="text-sm text-brand hover:underline">Back to dashboard</a>
      </div>
    </main>
  );
}
