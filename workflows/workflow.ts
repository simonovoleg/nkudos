import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { functionDefinition } from "../functions/function.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 *
 * This workflow uses interactivity. Learn more at:
 * https://api.slack.com/automation/forms#add-interactivity
 */
const workflow = DefineWorkflow({
  callback_id: "workflow",
  title: "The workflow",
  description: "The main workflow",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user", "interactivity"],
  },
});

/**
 * For collecting input from users, we recommend the
 * OpenForm Slack function as a first step.
 * https://api.slack.com/automation/functions#open-a-form
 */
const inputForm = workflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Send message to channel",
    interactivity: workflow.inputs.interactivity,
    submit_label: "Send message",
    fields: {
      elements: [
        {
          name: "channel",
          title: "Channel to send message to",
          type: Schema.slack.types.channel_id,
          // default: "C05JH69RX2A"
        }, 
        {
          name: "receiver",
          title: "Receiver",
          type: Schema.slack.types.user_id
        },
        {
          name: "message",
          title: "Message",
          type: Schema.types.string,
          long: true,
        }
      ],
      required: ["channel", "message"],
    },
  },
);

/**
 * Custom functions are reusable building blocks
 * of automation deployed to Slack infrastructure. They
 * accept inputs, perform calculations, and provide
 * outputs, just like typical programmatic functions.
 * https://api.slack.com/automation/functions/custom
 */
const functionStep = workflow.addStep(functionDefinition, {
  message: inputForm.outputs.fields.message,
  user: workflow.inputs.user,
});

/**
 * SendMessage is a Slack function. These are
 * Slack-native actions, like creating a channel or sending
 * a message and can be used alongside custom functions in a workflow.
 * https://api.slack.com/automation/functions
 */
workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: inputForm.outputs.fields.channel,
  message: functionStep.outputs.updatedMsg,
});

export default workflow;
