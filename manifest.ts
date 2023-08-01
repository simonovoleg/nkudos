import { Manifest } from "deno-slack-sdk/mod.ts";
import workflow from "./workflows/workflow.ts";
import { UserDatastore } from "./datastores/users.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "nkudos-hjung",
  description: "A template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  workflows: [workflow],
  outgoingDomains: [],
  datastores: [UserDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
