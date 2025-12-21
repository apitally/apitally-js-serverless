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
<p align="center" style="color: #ccc;">Real-time metrics, request logs, and alerts for your APIs — with just a few lines of code.</p>
<br>
<img alt="Apitally screenshots" src="https://assets.apitally.io/screenshots/overview.png">
<br>

# Apitally SDK for serverless JavaScript runtimes

[![Tests](https://github.com/apitally/apitally-js-serverless/actions/workflows/tests.yaml/badge.svg?event=push)](https://github.com/apitally/apitally-js-serverless/actions)
[![Codecov](https://codecov.io/gh/apitally/apitally-js-serverless/graph/badge.svg?token=sFIDRfSfca)](https://codecov.io/gh/apitally/apitally-js-serverless)
[![npm](https://img.shields.io/npm/v/@apitally/serverless?logo=npm&color=%23cb0000)](https://www.npmjs.com/package/@apitally/serverless)

This SDK for Apitally currently supports the following web frameworks:

- [Hono](https://docs.apitally.io/setup-guides/hono-serverless)

The following serverless platforms are supported:

- [Cloudflare Workers](https://docs.apitally.io/setup-guides/cloudflare-workers) (via Logpush)

Learn more about Apitally on our 🌎 [website](https://apitally.io) or check out
the 📚 [documentation](https://docs.apitally.io).

## Key features

### API analytics

Track traffic, error and performance metrics for your API, each endpoint and individual API consumers, allowing you to make informed, data-driven engineering and product decisions.

### Error tracking

Understand which validation rules in your endpoints cause client errors. Capture error details and stack traces for 500 error responses, and have them linked to Sentry issues automatically.

### Request logging

Drill down from insights to individual requests or use powerful filtering to understand how consumers have interacted with your API. Configure exactly what is included in the logs to meet your requirements.

### API monitoring & alerting

Get notified immediately if something isn't right using custom alerts, synthetic uptime checks and heartbeat monitoring. Notifications can be delivered via email, Slack or Microsoft Teams.

## Installation

You can install this library in your project using `npm` or `yarn`:

```bash
npm install @apitally/serverless
```

or

```bash
yarn add @apitally/serverless
```

## Usage

Our comprehensive [setup guides](https://docs.apitally.io/setup-guides) include
all the details you need to get started.

### Hono

This is an example of how to use the Apitally middleware with a Hono application running on a supported serverless platform.
For further instructions, see our [setup guide for Hono](https://docs.apitally.io/frameworks/hono-serverless).

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
```

## Getting help

If you need help please [create a new discussion](https://github.com/orgs/apitally/discussions/categories/q-a) on GitHub
or [join our Slack workspace](https://join.slack.com/t/apitally-community/shared_invite/zt-2b3xxqhdu-9RMq2HyZbR79wtzNLoGHrg).

## License

This library is licensed under the terms of the MIT license.
