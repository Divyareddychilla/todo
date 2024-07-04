import React, { useState } from "react";
import "./Userlist.css";

const users: string[] = ["Divyareddychilla", "Sowmya", "Meghana", "Prashanthi", "Rupavathi"];

const Userlist: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    shifts: "",
    userType: "",
    employeeId: ""
  });

  const handleEditClick = (userIndex: number) => {
    const userData = users[userIndex].split(" ");
    setEditData({
      username: userData[0],
      email: "",
      password: "",
      phoneNumber: "",
      shifts: "",
      userType: "",
      employeeId: ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    // Add logic here to save the edited data
    setOpen(false);
  };

  return (
    <div className="app_userlist">
      <div className="userlist-container">
        <h4 className="mainheading_userlist">User List Information</h4>
        <table className="userlist-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="user-item">
                <td>{user}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEditClick(index)}>✏️</button>
                </td>
                <td>
                  <button className="delete-btn">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form className="signup_form_signup">
              <h3 className="sub_heading_signup">Edit User Information</h3>
              <div className="input_group_signup">
                <input placeholder="Username" type="text" className="input_field_signup" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} />
              </div>
              <div className="input_group_signup">
                <input placeholder="Email" type="email" className="input_field_signup" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
              </div>
              <div className="input_group_signup">
                <input placeholder="Password" type="password" className="input_field_signup" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
              </div>
              <div className="input_group_signup">
                <input placeholder="Phone Number" type="tel" className="input_field_signup" value={editData.phoneNumber} onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })} />
              </div>
              <div className="input_group_signup">
                <label>Shifts</label>
                <select className="input_field_signup" value={editData.shifts} onChange={(e) => setEditData({ ...editData, shifts: e.target.value })}>
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="evening">Evening Shift</option>
                  <option value="night">Night Shift</option>
                </select>
              </div>
              <div className="input_group_signup">
                <label>User Type</label>
                <select className="input_field_signup" value={editData.userType} onChange={(e) => setEditData({ ...editData, userType: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="worker">Worker</option>
                </select>
              </div>
              <div className="input_group_signup">
                <label>Employee ID</label>
                <input type="text" className="input_field_signup" value={editData.employeeId} onChange={(e) => setEditData({ ...editData, employeeId: e.target.value })} />
              </div>
              <button className="signup_button" type="submit" onClick={handleSave}>Save</button>
              <button className="cancel_button" type="button" onClick={handleClose}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Userlist;