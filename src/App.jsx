import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const mainColumns = [
  { key: "todo", title: "To Do" },
  { key: "doing", title: "Doing" },
  { key: "done", title: "Done" },
];

const endorsementColumns = [
  { key: "appsgaming", title: "IT Apps Gaming" },
  { key: "ittss", title: "IT TSS" },
];

const allColumns = [...mainColumns, ...endorsementColumns];

function App() {
  const [taskText, setTaskText] = useState("");
  const [status, setStatus] = useState("todo");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) {
      setTasks(savedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = () => {
    if (!taskText.trim()) return;

    if (editingId) {
      setTasks(
        tasks.map((task) =>
          task.id === editingId
            ? { ...task, title: taskText, status }
            : task
        )
      );
      setEditingId(null);
    } else {
      const newTask = {
        id: Date.now(),
        title: taskText,
        status,
      };
      setTasks([...tasks, newTask]);
    }

    setTaskText("");
    setStatus("todo");
  };

  const handleEdit = (task) => {
    setTaskText(task.title);
    setStatus(task.status);
    setEditingId(task.id);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const moveTask = (id, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (newStatus) => {
    if (!draggedTaskId) return;

    setTasks(
      tasks.map((task) =>
        task.id === draggedTaskId ? { ...task, status: newStatus } : task
      )
    );

    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getColumnClass = (key) => {
    switch (key) {
      case "todo":
        return "todo-header";
      case "doing":
        return "doing-header";
      case "done":
        return "done-header";
      case "appsgaming":
        return "appsgaming-header";
      case "ittss":
        return "ittss-header";
      default:
        return "";
    }
  };

  const exportEndorsementToExcel = () => {
  const endorsementTasks = tasks.filter(
    (task) => task.status === "appsgaming" || task.status === "ittss"
  );

  const data = endorsementTasks.map((task, index) => {
    let exportStatus = "";

    switch (task.status) {
      case "appsgaming":
        exportStatus = "For Endorsement to IT Apps Gaming";
        break;
      case "ittss":
        exportStatus = "For Endorsement to IT TSS";
        break;
      default:
        exportStatus = task.status;
    }

    return {
      No: index + 1,
      Task: task.title,
      Status: exportStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Endorsements");
  XLSX.writeFile(workbook, "endorsement-tasks.xlsx");
};

  const exportToExcel = () => {
  const data = tasks.map((task, index) => {
    let exportStatus = "";

    switch (task.status) {
      case "todo":
        exportStatus = "To Do";
        break;
      case "doing":
        exportStatus = "Doing";
        break;
      case "done":
        exportStatus = "Done";
        break;
      case "appsgaming":
        exportStatus = "For Endorsement to IT Apps Gaming";
        break;
      case "ittss":
        exportStatus = "For Endorsement to IT TSS";
        break;
      default:
        exportStatus = task.status;
    }

    return {
      No: index + 1,
      Task: task.title,
      Status: exportStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  XLSX.writeFile(workbook, "ian-task-and-goals.xlsx");
  };

  const renderTasks = (columnStatus) => {
    const filteredTasks = tasks.filter((task) => task.status === columnStatus);

    if (filteredTasks.length === 0) {
      return <p className="empty-text">No tasks here yet.</p>;
    }

    return filteredTasks.map((task) => (
      <div
        key={task.id}
        className="task-card"
        draggable
        onDragStart={() => handleDragStart(task.id)}
      >
        <p className="task-title">{task.title}</p>

        <div className="task-actions">
          <button className="btn light-btn" onClick={() => handleEdit(task)}>
            Edit
          </button>

          <button className="btn danger-btn" onClick={() => handleDelete(task.id)}>
            Delete
          </button>
        </div>

        <div className="quick-move">
          <label>Move to:</label>
          <select
            value={task.status}
            onChange={(e) => moveTask(task.id, e.target.value)}
          >
            {allColumns.map((column) => (
              <option key={column.key} value={column.key}>
                {column.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    ));
  };

  const renderColumn = (column) => (
    <div
      key={column.key}
      className="column"
      onDrop={() => handleDrop(column.key)}
      onDragOver={handleDragOver}
    >
      <div className={`column-header ${getColumnClass(column.key)}`}>
        <span>{column.title}</span>
        <span className="count">
          {tasks.filter((task) => task.status === column.key).length}
        </span>
      </div>

      <div className="column-body">{renderTasks(column.key)}</div>
    </div>
  );

  return (
    <div className="app">
      <div className="page-shell">
        <header className="hero">
          <h1>My Task and Goals</h1>
          <p>Track your shit!</p>
        </header>

        <section className="task-form-card">
          <div className="task-form-left">
            <label className="label">Task Description</label>
            <textarea
              placeholder="Write your task or goal here..."
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
          </div>

          <div className="task-form-right">
            <label className="label">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {allColumns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.title}
                </option>
              ))}
            </select>

            <button className="main-btn" onClick={handleSubmit}>
              {editingId ? "Update Task" : "Add Task"}
            </button>

             <button className="export-btn" onClick={exportToExcel}>
              Export My Task
              </button>

            <button className="endorsement-export-btn" onClick={exportEndorsementToExcel}>
              Export Endorsement
            </button> 
            {/* <button className="export-btn" onClick={exportToExcel}>
              Export to Excel
            </button> */}
          </div>
        </section>

        <section className="board top-board">
          {mainColumns.map(renderColumn)}
        </section>

        <section className="endorsement-section">
          <div className="section-title">For Endorsement</div>
          <div className="board bottom-board">
            {endorsementColumns.map(renderColumn)}
          </div>
        </section>
      </div>
    </div>
  );
}


export default App;