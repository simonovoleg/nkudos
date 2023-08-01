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
    },
    required: ["message"],
  },
  output_parameters: {
    properties: {
      updatedMsg: {
        type: Schema.types.string,
        description: "Updated message to be posted",
      },
    },
    required: ["updatedMsg"],
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
    const updatedMsg = `:tada: ` + `Congrats <@${inputs.receiver}>!!` +
      ` You just received an nKudo from <@${inputs.user}> \n\n>*nKudo value*: ${inputs.kudo_value} \n>*message*: ${inputs.message}`;

    const newObject = {
      original_msg: inputs.message,
      updated_msg: updatedMsg,
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

    return { outputs: { updatedMsg } };
  },
);
