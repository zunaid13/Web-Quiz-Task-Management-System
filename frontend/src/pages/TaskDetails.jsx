import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserApi from "../api/UserApi";
import { useAuthContext } from "../hooks/useAuthContext";
import style from "../style/TaskDetails.module.css";
import { formatDateAndTime } from "../utilities/formatDate";

export default function TaskDetails() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { task } = location.state;
  const { title, description, dueDate, priority, categories, completed } = task;
  const [completeStatus, setCompleteStatus] = useState(completed);
  const { user } = useAuthContext();

  useEffect(() => {
    toast.onChange((payload) => {
      if (payload.status === "removed") {
        // Refresh the page
        navigate("/");
      }
    });
  }, [navigate]);

  async function markAsDone() {
    setError(false);
    setLoading(true);
    const categories = task.categories?.map((category) => category).join(",");
    const dueDate = formatDateAndTime(task.dueDate).date;
    const tempObj = {
      ...task,
      completed: 1,
      task_id: task._id,
      categories,
      due_date: dueDate,
    };
    try {
      const response = await UserApi.put("/update-task", tempObj, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`,
        },
      });
      setLoading(false);

      toast.success("Task completed..", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });

      setCompleteStatus(true);
    } catch (err) {
      setError(err.response.data.error);
      setLoading(false);
      console.log(err);
    }
  }

  async function deleteTask() {
    setError(false);
    setLoading(true);
    try {
      const response = await UserApi.post(
        "/delete-task",
        { task_id: task._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user}`,
          },
        }
      );
      setLoading(false);

      toast.success("Task deleted..", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });

      console.log(response.data);
    } catch (err) {
      setError(err.response.data.error);
      setLoading(false);
      console.log(err);
    }
  }

  return (
    <>
      <div className={style["task-details-container"]}>
        <h2 className={style["task-title"]}>{title}</h2>
        <div className={style["task-info"]}>
          <p>
            <strong>Description:</strong> {description}
          </p>
          <p>
            <strong>Due Date:</strong> {formatDateAndTime(dueDate).date}
          </p>
          <p>
            <strong>Priority:</strong> {priority}
          </p>
          <p>
            <strong>Categories:</strong>{" "}
            {categories?.map((category) => category).join(", ")}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={style[completeStatus ? "completed" : "pending"]}>
              {completeStatus ? "Done" : "Pending..."}
            </span>
          </p>
        </div>
      </div>

      <div className={style["details-button"]}>
        <Link
          to="/create-task"
          state={{
            editMode: true,
            task,
          }}
          className={`${style["btn"]} ${style["edit-btn"]}`}
        >
          Edit Details
        </Link>
        <button
          className={`${style["btn"]} ${style["done-btn"]}`}
          onClick={markAsDone}
          disabled={completeStatus}
        >
          {completeStatus ? "Already Done" : "Mark As Done"}
        </button>
        <button
          onClick={deleteTask}
          className={`${style["btn"]} ${style["delete-btn"]}`}
        >
          Delete
        </button>
      </div>
      <ToastContainer position="top-right" />
    </>
  );
}
