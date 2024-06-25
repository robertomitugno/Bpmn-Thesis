export var ACTIVITY_INTO_BATCH = [
  {
    label: "Batch Activity",
    actionName: "replace-with-batch",
    className: "bpmn-icon-service",
    target: {
      type: "factory:Batch"
    }
  }
];


export var BATCH_INTO_ACTIVITY = [
  {
    label: "Task",
    actionName: "replace-with-task",
    className: "bpmn-icon-task",
    target: {
      type: "bpmn:Task"
    }
  }
];