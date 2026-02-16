<p align="center">
  <a href="https://apitally.io" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.apitally.io/logos/logo-horizontal-new-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="https://assets.apitally.io/logos/logo-horizontal-new-light.png">
      <img alt="Apitally logo" src="https://assets.apitally.io/logos/logo-horizontal-new-light.png" width="220">
    </picture>
  </a>
</p>
<p align="center"><b>API monitoring & analytics made simple</b></p>
<p align="center" style="color: #ccc;">Metrics, logs, and alerts for your serverless APIs — with just a few lines of code.</p>
<br>
<img alt="Apitally screenshots" src="https://assets.apitally.io/screenshots/overview.png">
<br>

# Apitally SDK for Cloudflare Workers

[![Tests](https://github.com/apitally/apitally-js-serverless/actions/workflows/tests.yaml/badge.svg?event=push)](https://github.com/apitally/apitally-js-serverless/actions)
[![Codecov](https://codecov.io/gh/apitally/apitally-js-serverless/graph/badge.svg?token=sFIDRfSfca)](https://codecov.io/gh/apitally/apitally-js-serverless)
[![npm](https://img.shields.io/npm/v/@apitally/serverless?logo=npm&color=%23cb0000)](https://www.npmjs.com/package/@apitally/serverless)

Apitally is a simple API monitoring and analytics tool that makes it easy to understand how your APIs are used
and helps you troubleshoot API issues faster. Setup is easy and takes less than 5 minutes.

Learn more about Apitally on our 🌎 [website](https://apitally.io) or check out
the 📚 [documentation](https://docs.apitally.io).

This SDK is for APIs running on [Cloudflare Workers](https://developers.cloudflare.com/workers/) and relies on [Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/) to send data to Apitally.

## Key features

### API analytics

Track traffic, error and performance metrics for your API, each endpoint and
individual API consumers, allowing you to make informed, data-driven engineering
and product decisions.

### Request logs

Drill down from insights to individual API requests or use powerful search and filters to
find specific requests. View correlated application logs for a complete picture
of each request, making troubleshooting faster and easier.

### Error tracking

Understand which validation rules in your endpoints cause client errors. Capture
error details and stack traces for 500 error responses.

### API monitoring & alerts

Get notified immediately if something isn't right using custom alerts and synthetic
uptime checks. Alert notifications can be delivered via email, Slack and Microsoft Teams.

## Supported frameworks

| Framework                                  | Supported versions | Setup guide                                                           |
| ------------------------------------------ | ------------------ | --------------------------------------------------------------------- |
| [**Hono**](https://github.com/honojs/hono) | `4.x`              | [Link](https://docs.apitally.io/setup-guides/hono-cloudflare-workers) |

Apitally also supports many other web frameworks in [JavaScript](https://github.com/apitally/apitally-js), [Python](https://github.com/apitally/apitally-py), [Go](https://github.com/apitally/apitally-go), [.NET](https://github.com/apitally/apitally-dotnet) and [Java](https://github.com/apitally/apitally-java) via our other SDKs.

## Getting started

If you don't have an Apitally account yet, first [sign up here](https://app.apitally.io/?signup).

### 1. Create app in Apitally

Create an app in the Apitally dashboard and select **Hono (Cloudflare Workers)** as your framework. You'll see detailed setup instructions, which also include your client ID.

### 2. Create Logpush job

Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and navigate to _Analytics & Logs > Logpush_. Create a [Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/) job with the following settings:

| Setting                      | Value                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Destination                  | HTTP destination                                                                   |
| HTTP endpoint                | `https://hub.apitally.io/v2/{client-id}/{env}/logpush`                             |
| Dataset                      | Workers trace events                                                               |
| If logs match...             | Filtered logs: EventType equals `fetch` and ScriptName equals `{your-worker-name}` |
| Send the following fields... | General: Event, EventTimestampMs, Logs                                             |

In the HTTP endpoint, replace `{client-id}` with your app's client ID and `{env}` with the environment (e.g. `prod` or `dev`). In the filter criteria, replace `{your-worker-name}` with the name of your Worker, as specified in your Wrangler config.

### 3. Configure Worker

Enable [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/) and [Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/) in your `wrangler.toml` configuration file:

```toml
logpush = true

[observability]
enabled = true
head_sampling_rate = 1

[observability.logs]
invocation_logs = true
```

### 4. Add middleware

Install the SDK:

```bash
npm install @apitally/serverless
```

Then add the Apitally middleware to your Hono application using the `useApitally` function:

```javascript
import { Hono } from "hono";
import { useApitally } from "@apitally/serverless/hono";

const app = new Hono();

useApitally(app, {
  logRequestHeaders: true,
  logRequestBody: true,
  logResponseHeaders: true,
  logResponseBody: true,
});

// Ensure route handlers are registered after useApitally()
```

For further instructions, see our
[setup guide for Hono on Cloudflare Workers](https://docs.apitally.io/setup-guides/hono-cloudflare-workers).

See the [SDK reference](https://docs.apitally.io/sdk-reference/javascript-serverless) for all available configuration options, including how to mask sensitive data, customize request logging, and more.

## Getting help

If you need help please
[create a new discussion](https://github.com/orgs/apitally/discussions/categories/q-a)
on GitHub or email us at [support@apitally.io](mailto:support@apitally.io). We'll get back to you as soon as possible.

## License

This library is licensed under the terms of the [MIT license](LICENSE).
