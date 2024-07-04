import './App.scss';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState, useEffect } from 'react';

interface Todo {
  todo_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

const GET_TODOS = gql`
  query Todos($sort: String!) {
    todos(sort: $sort) {
      todo_id
      title
      description
      completed
      created_at
    }
  }
`;

const ADD_TODO = gql`
  mutation CreateTodo($input: CreateTodoDto!) {
    createTodo(input: $input) {
      todo_id
      title
      description
      completed
      created_at
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($input: UpdateTodoDto!) {
    updateTodo(input: $input) {
      todo_id
      title
      description
      completed
      created_at
    }
  }
`;

const DELETE_TODO = gql`
  mutation Deletetodo($id: String!) {
    deletetodo(id: $id) {
      title
      description
      completed
      created_at
    }
  }
`;

function App() {
  const [sort, setSort] = useState("ASC");
  const [todoInput, setTodoInput] = useState({ title: "", description: "", completed: false });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Todo[]>([]);
  const [todoCount, setTodoCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const { loading, error, data, refetch } = useQuery(GET_TODOS, {
    variables: { sort },
    onCompleted: () => {
      if (data && data.todos) {
        setTodoCount(data.todos.length);
      }
    },
  });

  useEffect(() => {
    setCompletedCount(completedTasks.length);
  }, [completedTasks]);

  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: (data) => {
      refetch();
      setTodoInput({ title: "", description: "", completed: false });
      if (data && data.createTodo) {
        setTodoCount(todoCount + 1);
      }
    },
    onError: (error: any) => {
      console.error('Error adding todo:', error.message);
    }
  });

  const [updateTodo] = useMutation(UPDATE_TODO, {
    onCompleted: () => {
      refetch();
      setEditingTodo(null);
      setTodoInput({ title: "", description: "", completed: false });
    },
    onError: (error: any) => {
      console.error('Error updating todo:', error.message);
    }
  });

  const [deleteTodo] = useMutation(DELETE_TODO, {
    onCompleted: () => refetch(),
    onError: (error: any) => {
      console.error('Error deleting todo:', error.message);
    }
  });

  const handleAddTodo = async () => {
    if (todoInput.title.trim() === "") {
      alert("Title cannot be empty.");
      return;
    }

    try {
      await addTodo({
        variables: {
          input: {
            title: todoInput.title,
            description: todoInput.title,
            completed: Boolean(todoInput.completed)
          }
        }
      });
    } catch (error: any) {
      console.error('Error adding todo:', error.message);
    }
  };

  const handleEditTodo = async () => {
    if (editingTodo) {
      try {
        await updateTodo({
          variables: {
            input: {
              todo_id: editingTodo.todo_id,
              title: todoInput.title,
              description: todoInput.description,
              completed: Boolean(todoInput.completed)
            }
          }
        });
      } catch (error: any) {
        console.error('Error updating todo:', error.message);
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!id) {
      console.error('Error deleting todo: ID is required');
      return;
    }

    try {
      await deleteTodo({
        variables: { id },
        update: (cache) => {
          const existingTodos = cache.readQuery<{ todos: Todo[] }>({
            query: GET_TODOS,
            variables: { sort },
          });

          if (existingTodos) {
            const updatedTodos = existingTodos.todos.filter((todo) => todo.todo_id !== id);
            cache.writeQuery({
              query: GET_TODOS,
              variables: { sort },
              data: { todos: updatedTodos },
            });

            setTodoCount(updatedTodos.length);

            const updatedCompletedTasks = completedTasks.filter((todo) => todo.todo_id !== id);
            setCompletedTasks(updatedCompletedTasks);
            setCompletedCount(updatedCompletedTasks.length);
          }
        },
      });
    } catch (error: any) {
      console.error('Error deleting todo:', error.message);
    }
  };


  const handleCheckmarkClick = async (todo: Todo) => {
    try {
      await updateTodo({
        variables: {
          input: {
            todo_id: todo.todo_id,
            title: todo.title,
            description: todo.description,
            completed: true
          }
        }
      });
      setCompletedTasks([...completedTasks, todo]);
    } catch (error: any) {
      console.error('Error updating todo:', error.message);
    }
  };


  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setTodoInput({
      title: todo.title,
      description: todo.description,
      completed: Boolean(todo.completed)
    });
  };

  return (
    <div className='app'>
      <div className='container'>


        <div className="todo-input-container">
          <input
            type="text"
            placeholder="Add a new task"
            value={todoInput.title}
            onChange={(e) => setTodoInput({ ...todoInput, title: e.target.value })}
          />
          <div className="plusdiv">
            <svg
              onClick={editingTodo ? handleEditTodo : handleAddTodo}
              width="22"
              height="22"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.0534 9C19.0534 9.18234 18.9735 9.35721 18.8315 9.48614C18.6894 9.61507 18.4967 9.6875 18.2958 9.6875H10.7206V16.5625C10.7206 16.7448 10.6408 16.9197 10.4987 17.0486C10.3567 17.1776 10.164 17.25 9.96308 17.25C9.76217 17.25 9.56949 17.1776 9.42743 17.0486C9.28537 16.9197 9.20556 16.7448 9.20556 16.5625V9.6875H1.63033C1.42942 9.6875 1.23674 9.61507 1.09468 9.48614C0.952613 9.35721 0.872803 9.18234 0.872803 9C0.872803 8.81766 0.952613 8.6428 1.09468 8.51386C1.23674 8.38493 1.42942 8.3125 1.63033 8.3125H9.20556V1.4375C9.20556 1.25516 9.28537 1.0803 9.42743 0.951364C9.56949 0.822433 9.76217 0.75 9.96308 0.75C10.164 0.75 10.3567 0.822433 10.4987 0.951364C10.6408 1.0803 10.7206 1.25516 10.7206 1.4375V8.3125H18.2958C18.4967 8.3125 18.6894 8.38493 18.8315 8.51386C18.9735 8.6428 19.0534 8.81766 19.0534 9Z"
                fill="white"
              />
            </svg>
          </div>
        </div>



        <div className="task-header">
          <h6>Tasks to do - {todoCount}</h6>
          <button onClick={() => setSort(sort === "ASC" ? "DESC" : "ASC")}>
            Filter: {sort === "ASC" ? "DESC" : "ASC"}
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}


        <div className='todo_checkmark_div'>
          {data &&
            data.todos.filter((todo: Todo) => !completedTasks.some((completedTodo: Todo) => completedTodo.todo_id === todo.todo_id)).map((todo: Todo) => (
                <div className={`todo_card ${todo.completed ? 'completed' : ''}`} key={todo.todo_id}>
                  <div className="todo_content">
                    <p>
                      {todo.title}
                    </p>

                    <div className="todo_icons">
                      <svg onClick={() => handleCheckmarkClick(todo)} width="18" height="18" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.7851 1.67391L6.78513 12.6739C6.72128 12.7378 6.64546 12.7885 6.56199 12.8231C6.47853 12.8577 6.38907 12.8755 6.29872 12.8755C6.20837 12.8755 6.11891 12.8577 6.03545 12.8231C5.95199 12.7885 5.87617 12.7378 5.81232 12.6739L0.999816 7.86141C0.870813 7.7324 0.79834 7.55744 0.79834 7.375C0.79834 7.19256 0.870813 7.0176 0.999816 6.88859C1.12882 6.75959 1.30378 6.68712 1.48622 6.68712C1.66866 6.68712 1.84363 6.75959 1.97263 6.88859L6.29872 11.2155L16.8123 0.701094C16.9413 0.572091 17.1163 0.499619 17.2987 0.499619C17.4812 0.499619 17.6561 0.572091 17.7851 0.701094C17.9141 0.830097 17.9866 1.00506 17.9866 1.1875C17.9866 1.36994 17.9141 1.5449 17.7851 1.67391Z" fill="#9E78CF" />
                      </svg>


                      <svg onClick={() => startEditing(todo)} width="18" height="18" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.1067 0C16.2455 0 15.3843 0.33419 14.7159 1.00257L1.70823 14.0103L1.65681 14.2674L0.757069 18.7918L0.5 20L1.70823 19.7429L6.23265 18.8432L6.48972 18.7918L19.4974 5.78406C20.8342 4.4473 20.8342 2.33933 19.4974 1.00257C18.829 0.33419 17.9679 0 17.1067 0ZM17.1067 1.56812C17.5212 1.56812 17.9389 1.75771 18.3406 2.15938C19.1407 2.95951 19.1407 3.82712 18.3406 4.62725L17.7494 5.1928L15.3072 2.75064L15.8728 2.15938C16.2744 1.75771 16.6922 1.56812 17.1067 1.56812ZM14.1504 3.90745L16.5925 6.34961L6.64396 16.2982C6.10411 15.2442 5.25578 14.3959 4.2018 13.856L14.1504 3.90745ZM3.14781 15.1928C4.13432 15.5913 4.90874 16.3657 5.3072 17.3522L2.60797 17.892L3.14781 15.1928Z" fill="#9E78CF" />
                      </svg>
                      <svg onClick={() => handleDeleteTodo(todo.todo_id)} width="18" height="18" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.6112 4.125H3.48621C3.30387 4.125 3.129 4.19743 3.00007 4.32636C2.87114 4.4553 2.79871 4.63016 2.79871 4.8125C2.79871 4.99484 2.87114 5.1697 3.00007 5.29864C3.129 5.42757 3.30387 5.5 3.48621 5.5H4.17371V17.875C4.17371 18.2397 4.31857 18.5894 4.57643 18.8473C4.8343 19.1051 5.18403 19.25 5.54871 19.25H16.5487C16.9134 19.25 17.2631 19.1051 17.521 18.8473C17.7788 18.5894 17.9237 18.2397 17.9237 17.875V5.5H18.6112C18.7935 5.5 18.9684 5.42757 19.0973 5.29864C19.2263 5.1697 19.2987 4.99484 19.2987 4.8125C19.2987 4.63016 19.2263 4.4553 19.0973 4.32636C18.9684 4.19743 18.7935 4.125 18.6112 4.125ZM16.5487 17.875H5.54871V5.5H16.5487V17.875ZM6.92371 2.0625C6.92371 1.88016 6.99614 1.7053 7.12507 1.57636C7.254 1.44743 7.42887 1.375 7.61121 1.375H14.4862C14.6685 1.375 14.8434 1.44743 14.9723 1.57636C15.1013 1.7053 15.1737 1.88016 15.1737 2.0625C15.1737 2.24484 15.1013 2.4197 14.9723 2.54864C14.8434 2.67757 14.6685 2.75 14.4862 2.75H7.61121C7.42887 2.75 7.254 2.67757 7.12507 2.54864C6.99614 2.4197 6.92371 2.24484 6.92371 2.0625Z" fill="#9E78CF" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div className='completed_task_container'>
          <h3 className='completedtaskheading'>
            Done - {completedCount}
          </h3>
          {completedTasks.map((todo) => (
            <div key={todo.todo_id} className="todo_card todo_content">
              <span className="completed_task_title">{todo.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
