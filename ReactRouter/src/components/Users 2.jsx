import "./Users.css";
function Users() {
  return (

<div className="users-container">
      <h1>Users</h1>
      <p>Here are some sample users:</p>
    <div className="users-control">
      <select className="users">
        <option value="1">Alice</option>
        <option value="2">Bob</option>
        <option value="3">Charlie</option>   
      </select>

<button>Submit User</button>
</div>
</div>
  );
}
export default Users;
