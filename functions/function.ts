import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import OpenFormbjectDatastore from "../datastores/datastore.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const functionDefinition = DefineFunction({
  callback_id: "function",
  title: "Main function",
  description: "The main function",
  source_file: "functions/function.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Message to be posted",
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
      receiver: {
        type: Schema.slack.types.user_id,
        description: "The user receiving a kudo",
      },
      kudo_value: {
        type: Schema.types.string,
        description: "An nKudo value",
      },
      private_scope: {
        type: Schema.types.boolean,
        description: "Public or private messages",
      },
    },
    required: ["message"],
  },
  output_parameters: {
    properties: {
      public_message: {
        type: Schema.types.string,
        description: "Updated public message to be posted",
      },
      private_message: {
        type: Schema.types.string,
        description: "Updated private message to be posted",
      },
    },
    required: ["public_message", "private_message"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  functionDefinition,
  async ({ inputs, client }) => {
    const uuid = crypto.randomUUID();

    // inputs.user is set from the interactivity_context defined in trigger.ts
    // https://api.slack.com/automation/forms#add-interactivity
    const private_message = `:tada: ` + `Congrats <@${inputs.receiver}>!!` +
      ` You just received an nKudo from <@${inputs.user}> \n\n>*nKudo value*: ${inputs.kudo_value} \n>*message*: ${inputs.message} \n\n ${
        inputs.private_scope ? "_Sent privately_ :shushing_face:" : ""
    }`;

    const public_message = inputs.private_scope ? `:tada: Yay!! Somebody just received nKudos for being awesome in the following category: ${inputs.kudo_value}` : private_message;

    const newObject = {
      original_msg: inputs.message,
      updated_msg: private_message,
      object_id: uuid,
    };

    // Save the newObject to the datastore
    // https://api.slack.com/automation/datastores
    await client.apps.datastore.put<typeof objectDatastore.definition>(
      {
        datastore: "Objects",
        item: newObject,
      },
    );
    console.log(private_message)
    return { outputs: { public_message: public_message, private_message: private_message } };
  },
);
