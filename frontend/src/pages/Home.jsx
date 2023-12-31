import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserApi from "../api/UserApi";
import { useAuthContext } from "../hooks/useAuthContext";
import style from "../style/Home.module.css";
import { formatDateAndTime } from "../utilities/formatDate";

export default function Home() {
  const [priority, setPriority] = useState();
  const [due_date, setDueDate] = useState();
  const [sortDate, setSortDate] = useState(false);
  const [sortPriority, setSortPriority] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [storeTaskList, setStoreTaskList] = useState([]);

  const [searchBox, setSearchBox] = useState("");

  const priorityObject = {
    1: "High",
    2: "Medium",
    3: "Low",
  };

  const { user, logout, newUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  useEffect(() => {
    async function getTaskList() {
      try {
        setLoading(true);
        setError(false);
        const response = await UserApi.get("/get-tasks", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user}`,
          },
        });
        setTaskList(response.data.task);
        setStoreTaskList(response.data.task);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        setError(error);
      }
    }
    getTaskList();
  }, []);

  const sortTasks = (tasks, field, ascending = true) => {
    const sortedTasks = tasks.slice().sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (ascending) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sortedTasks;
  };

  const filterTasksByDate = (tasks, date) => {
    return tasks.filter(
      (task) => formatDateAndTime(task.dueDate).date === date
    );
  };

  const filterTasksByPriority = (tasks, priority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const filterTasksBySearch = (tasks, searchTerm) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return tasks.filter((task) =>
      task.title?.toLowerCase().includes(lowercasedSearchTerm)
    );
  };

  useEffect(() => {
    let updatedTasks = [...storeTaskList];

    if (due_date) {
      updatedTasks = filterTasksByDate(updatedTasks, due_date);
    }

    if (priority) {
      updatedTasks = filterTasksByPriority(updatedTasks, priority);
    }

    if (searchBox) {
      updatedTasks = filterTasksBySearch(updatedTasks, searchBox);
    }

    if (sortPriority) {
      updatedTasks = sortTasks(updatedTasks, "priority");
    }

    if (sortDate) {
      updatedTasks = sortTasks(updatedTasks, "dueDate");
    }

    setTaskList(updatedTasks);
  }, [due_date, priority, searchBox, sortPriority, sortDate, storeTaskList]);

  return (
    <div>
      <div className={style["navbar"]}>
        <div className={style["logout-container"]} onClick={handleLogout}>
          <span className={style["logout-text"]}>Logout</span>
        </div>
      </div>
      <div className={style["centered-container"]}>
        <Link
          to="/create-task"
          className={`${style["create-new-task-btn"]} ${style["create-new-task-btn-large"]}`}
        >
          Create New Task
        </Link>
      </div>
      <div className={style["filter-sort"]}>
        <form>
          <div>
            <label htmlFor="priority">Priority</label>
            <select
              name="priority"
              id="priority"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
            >
              <option value="default">Default</option>
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>
          </div>
          <div>
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              name="due_date"
              id="due_date"
              value={due_date}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <input
              type="button"
              className="btn"
              name="priority-sort"
              id="date-sort"
              value={`Sort By Priority`}
              onClick={() => setSortPriority((prev) => !prev)}
            />
          </div>
          <div>
            <input
              type="button"
              className="btn"
              name="date-sort"
              id="date-sort"
              value={`Sort By Date`}
              onClick={() => setSortDate((prev) => !prev)}
            />
          </div>
        </form>
      </div>

      <div className={style["search-box"]}>
        <input
          type="text"
          name="search-box"
          id=""
          placeholder="Search Box (Title or Category)"
          value={searchBox}
          onChange={(e) => setSearchBox(e.target.value)}
        />
      </div>
      {/* Add a heading before the task cards */}
  <h2 style={{ textAlign: "center", fontSize: "24px", marginTop: "20px" }}>
    All Tasks
  </h2>
      <div className={style["taskbox"]}>
  {taskList &&
    !loading &&
    !error &&
    taskList.map((task, index) => (
      <div key={index} className={style["task-card"]}>
        <h3>{task.title}</h3>
        <div className={style["task-info"]}>
          <p>
            <b>Due Date: </b>
            {formatDateAndTime(task.dueDate).date}
          </p>
          <p>
            <b>Priority: </b>
            {priorityObject[task.priority]}
          </p>
          <p>
            <b>Categories: </b>
            {task.categories?.map((category) => category).join(", ")}
          </p>
          <p>
            <b>Status: </b>
            {task.completed ? "Done" : "Pending.."}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
            <Link
              to="/task-details"
              state={{ task }}
              className={style["view-details-btn"]}
            >
              View Details
            </Link>
          </div>
      </div>
    ))}
</div>
    </div>
  );
}
