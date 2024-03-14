//Declaring variables that are referencing the DOM
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

//Generates ID to assign to tasks for organization
function generateTaskId() {
  if (nextId === null) {
    nextId = 1;
  } else {
    nextId++;
  }

  //Stringifies task IDs to local storage
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
}

//Function to dynamically create the card with the task itself and adds it to the webpage
function createTaskCard(task) {
  //Declaring variables to create and reference DOM elements while also applying the appropriate classes for Bootstrap
  const taskCard = $("<div>")
    .addClass("card w-75 task-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
    
    //Listens for a click event on the delete button and calls the handleDeleteTask function to delete the task card
  cardDeleteBtn.on("click", handleDeleteTask);

  //Checks the due date on the card with the current date and adjusts the cards' color according to how close they are or if it's past the date
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  //Appends the task card to the card body and then to the actual card itself
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

//Function to render the task list
function renderTaskList() {
  //If the taskList value is 'null', assigns the variable an empty array
  if (!taskList) {
    taskList = [];
  }

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  //Appends the task card to the webpage if the status matches one of the else if conditionals
  for (let task of taskList) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  //Makes the cards draggable so they can be moved into appropriate lanes
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        maxWidth: original.outerWidth(),
      });
    },
  });
}

//Function to add a new task card to the 'to-do' lane
function handleAddTask(event) {
  //Stops the page from refreshing when the'Add Task' button is pressed  
  event.preventDefault();

  //Creates a task object to hold all the info from the user's inputs
  const task = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };

  //Pushes the new task object into the taskList array, stringifies the array into local storage, and clears the input fields in the modal form
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
}

//Function to delete the corresponding task card
function handleDeleteTask(event) {
  event.preventDefault();
  
  //References the card the pressed button is nested in using 'this'
  const taskId = $(this).attr("data-task-id");

  //Updates the task ID so and calls the renderTaskList function to rerender the cards and remove this task since it doesn't meet the criteria for the 'else if' statements
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

//Function that handles the task card being dropped into the status lanes
function handleDrop(event, ui) {
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  //Iterates through each task object in the taskList array and updates the status when the if conditional is met
  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }

  //Stringifies the taskList array into local storage and calls the renderTaskList function to update the card position
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

//Sets up interaction on the webpage once the page fully loads and is ready for use
$(document).ready(function () {
  renderTaskList();

  //Runs the handleAddTask function when the Add Task button in the modal form is pressed
  $("#taskForm").on("submit", handleAddTask);

  //Sets the 'To Do', 'In Progress', and 'Done' columns/categories as droppable targets for the cards that are draggable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });

  //Turns date input field into datepicker with dropdowns for month and year
  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
