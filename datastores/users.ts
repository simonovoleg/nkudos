// datastores/good_tunes_datastore.ts
import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const UserDatastore = DefineDatastore({
  name: "users",
  primary_key: "id",
  attributes: {
    id: { 
      type: Schema.slack.types.user_id
    },
    giving_points: { 
      type: Schema.types.integer 
    },
    received_nkudos: {
      type: Schema.types.array,
      items: {
        type: Schema.types.object,
        properties: {
          from: { type: Schema.types.string },
          value: { type: Schema.types.string },
          message: { type: Schema.types.string },
          received_at: { type: Schema.types.string }
        }
      }
    },
  },
});
