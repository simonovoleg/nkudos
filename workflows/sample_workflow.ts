import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SampleFunctionDefinition } from "../functions/sample_function.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 *
 * This workflow uses interactivity. Learn more at:
 * https://api.slack.com/automation/forms#add-interactivity
 */
const SampleWorkflow = DefineWorkflow({
  callback_id: "sample_workflow",
  title: "Sample workflow",
  description: "A sample workflow",
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
const inputForm = SampleWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Send message to channel",
    interactivity: SampleWorkflow.inputs.interactivity,
    submit_label: "Send message",
    fields: {
      elements: [
        {
          name: "receiver",
          title: "Receiver",
          type: Schema.slack.types.user_id,
        },
        {
          name: "message",
          title: "Message",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "kudo_value",
          title: "Which value?",
          type: Schema.types.string,
          enum: [
            "Team player ⚽️",
            "Innovation champion 🏆",
            "Customer driven 🫂",
            "Leadership ☄️",
          ],
        },
      ],
      required: ["receiver", "message", "kudo_value"],
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
const sampleFunctionStep = SampleWorkflow.addStep(SampleFunctionDefinition, {
  message: inputForm.outputs.fields.message,
  user: SampleWorkflow.inputs.user,
  receiver: inputForm.outputs.fields.receiver,
  kudo_value: inputForm.outputs.fields.kudo_value,
});

/**
 * SendMessage is a Slack function. These are
 * Slack-native actions, like creating a channel or sending
 * a message and can be used alongside custom functions in a workflow.
 * https://api.slack.com/automation/functions
 */
SampleWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: "C05JH69RX2A",
  message: sampleFunctionStep.outputs.updatedMsg,
});

export default SampleWorkflow;
