import { useEffect, useState } from "react";

function App() {
  const [taskText, setTaskText] = useState("");
  const [status, setStatus] = useState("todo");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  const renderTasks = (columnStatus) => {
    const filteredTasks = tasks.filter((task) => task.status === columnStatus);

    if (filteredTasks.length === 0) {
      return <p className="empty-text">No tasks here yet.</p>;
    }

    return filteredTasks.map((task) => (
      <div key={task.id} className="task-card">
        <p className="task-title">{task.title}</p>

        <div className="task-actions">
          <button className="btn light-btn" onClick={() => handleEdit(task)}>
            Edit
          </button>

          <button className="btn danger-btn" onClick={() => handleDelete(task.id)}>
            Delete
          </button>

          {columnStatus === "todo" && (
            <button className="btn action-btn" onClick={() => moveTask(task.id, "doing")}>
              Move to Doing
            </button>
          )}

          {columnStatus === "doing" && (
            <>
              <button className="btn light-btn" onClick={() => moveTask(task.id, "todo")}>
                Back to To Do
              </button>
              <button className="btn success-btn" onClick={() => moveTask(task.id, "done")}>
                Move to Done
              </button>
            </>
          )}

          {columnStatus === "done" && (
            <button className="btn light-btn" onClick={() => moveTask(task.id, "doing")}>
              Back to Doing
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="app">
      <div className="page-shell">
        <header className="hero">
          <h1>My Task and Goals</h1>
          <p>Track your priorities, manage your progress.</p>
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
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>

            <button className="main-btn" onClick={handleSubmit}>
              {editingId ? "Update Task" : "Add Task"}
            </button>
          </div>
        </section>

        <section className="board">
          <div className="column">
            <div className="column-header todo-header">
              <span>To Do</span>
              <span className="count">{tasks.filter((task) => task.status === "todo").length}</span>
            </div>
            <div className="column-body">{renderTasks("todo")}</div>
          </div>

          <div className="column">
            <div className="column-header doing-header">
              <span>Doing</span>
              <span className="count">{tasks.filter((task) => task.status === "doing").length}</span>
            </div>
            <div className="column-body">{renderTasks("doing")}</div>
          </div>

          <div className="column">
            <div className="column-header done-header">
              <span>Done</span>
              <span className="count">{tasks.filter((task) => task.status === "done").length}</span>
            </div>
            <div className="column-body">{renderTasks("done")}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;