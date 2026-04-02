import { useEffect, useRef, useState } from "react";
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

  const [incidentNumber, setIncidentNumber] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [affectedUsers, setAffectedUsers] = useState("");
  const [systems, setSystems] = useState("");
  const [actionItem, setActionItem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [issues, setIssues] = useState([]);
  const [editingIssueId, setEditingIssueId] = useState(null);

  const issueListRef = useRef(null);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) setTasks(savedTasks);

    const savedIssues = JSON.parse(localStorage.getItem("issues"));
    if (savedIssues) setIssues(savedIssues);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("issues", JSON.stringify(issues));
  }, [issues]);

  const handleSubmit = () => {
    if (!taskText.trim()) return;

    if (editingId) {
      setTasks(
        tasks.map((task) =>
          task.id === editingId ? { ...task, title: taskText, status } : task
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

  const handleIssueSubmit = () => {
    if (
      !incidentNumber.trim() &&
      !issueDescription.trim() &&
      !affectedUsers.trim() &&
      !systems.trim() &&
      !actionItem.trim() &&
      !startDate.trim() &&
      !dueDate.trim()
    ) {
      return;
    }

    if (editingIssueId) {
      setIssues(
        issues.map((issue) =>
          issue.id === editingIssueId
            ? {
                ...issue,
                incidentNumber,
                description: issueDescription,
                affectedUsers,
                systems,
                actionItem,
                startDate,
                dueDate,
              }
            : issue
        )
      );
      setEditingIssueId(null);
    } else {
      const newIssue = {
        id: Date.now(),
        incidentNumber,
        description: issueDescription,
        affectedUsers,
        systems,
        actionItem,
        startDate,
        dueDate,
      };
      setIssues([...issues, newIssue]);
    }

    setIncidentNumber("");
    setIssueDescription("");
    setAffectedUsers("");
    setSystems("");
    setActionItem("");
    setStartDate("");
    setDueDate("");
  };

  const handleEditIssue = (issue) => {
    setIncidentNumber(issue.incidentNumber || "");
    setIssueDescription(issue.description || "");
    setAffectedUsers(issue.affectedUsers || "");
    setSystems(issue.systems || "");
    setActionItem(issue.actionItem || "");
    setStartDate(issue.startDate || "");
    setDueDate(issue.dueDate || "");
    setEditingIssueId(issue.id);

    issueListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteIssue = (id) => {
    setIssues(issues.filter((issue) => issue.id !== id));
  };

  const goToIssueList = () => {
    issueListRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const exportToExcel = () => {
    const normalTasks = tasks.filter(
      (task) =>
        task.status === "todo" ||
        task.status === "doing" ||
        task.status === "done"
    );

    const data = normalTasks.map((task, index) => {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Tasks");
    XLSX.writeFile(workbook, "ian-my-tasks.xlsx");
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
    XLSX.writeFile(workbook, "ian-endorsement-tasks.xlsx");
  };

  const exportIssueListToExcel = () => {
    const data = issues.map((issue, index) => ({
      No: index + 1,
      "Incident Number": issue.incidentNumber,
      Description: issue.description,
      "Affected Business Users": issue.affectedUsers,
      Systems: issue.systems,
      "Action Item": issue.actionItem,
      "Start Date": issue.startDate,
      "Due Date": issue.dueDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issue List");
    XLSX.writeFile(workbook, "ian-issue-list.xlsx");
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
          <p>PEPOL OF OKADA PELEPENS</p>
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

            <button className="issue-nav-btn" onClick={goToIssueList}>
              Go to Issue List
            </button>
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

        <section className="issue-section" ref={issueListRef}>
          <div className="issue-section-header">
            <h2>Issue List</h2>
            <button className="issue-export-btn" onClick={exportIssueListToExcel}>
              Export Issue List
            </button>
          </div>

          <div className="issue-form-grid">
            <div className="issue-field">
              <label>Incident Number</label>
              <input
                type="text"
                placeholder="Enter incident number"
                value={incidentNumber}
                onChange={(e) => setIncidentNumber(e.target.value)}
              />
            </div>

            <div className="issue-field">
              <label>Affected Business Users</label>
              <input
                type="text"
                placeholder="Enter affected business users"
                value={affectedUsers}
                onChange={(e) => setAffectedUsers(e.target.value)}
              />
            </div>

            <div className="issue-field">
              <label>Systems</label>
              <input
                type="text"
                placeholder="Enter systems"
                value={systems}
                onChange={(e) => setSystems(e.target.value)}
              />
            </div>

            <div className="issue-field">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="issue-field">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="issue-field issue-field-wide">
              <label>Description</label>
              <textarea
                className="issue-textarea"
                placeholder="Enter issue description"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </div>

            <div className="issue-field issue-field-wide">
              <label>Action Item</label>
              <textarea
                className="issue-textarea"
                placeholder="Enter action item"
                value={actionItem}
                onChange={(e) => setActionItem(e.target.value)}
              />
            </div>

            <div className="issue-field issue-button-wrap">
              <button className="main-btn" onClick={handleIssueSubmit}>
                {editingIssueId ? "Update Issue" : "Add Issue"}
              </button>
            </div>
          </div>

          <div className="issue-table-wrap">
            <table className="issue-table">
              <thead>
                <tr>
                  <th>Incident Number</th>
                  <th>Description</th>
                  <th>Affected Business Users</th>
                  <th>Systems</th>
                  <th>Action Item</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-issues">
                      No issues added yet.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="wrap-cell">{issue.incidentNumber}</td>
                      <td className="wrap-cell">{issue.description}</td>
                      <td className="wrap-cell">{issue.affectedUsers}</td>
                      <td className="wrap-cell">{issue.systems}</td>
                      <td className="wrap-cell">{issue.actionItem}</td>
                      <td>{issue.startDate}</td>
                      <td>{issue.dueDate}</td>
                      <td>
                        <div className="issue-actions">
                          <button
                            className="btn light-btn"
                            onClick={() => handleEditIssue(issue)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn danger-btn"
                            onClick={() => handleDeleteIssue(issue.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;