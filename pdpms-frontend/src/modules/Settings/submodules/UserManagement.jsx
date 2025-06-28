import './UserManagement.css';


export default function UserManagement() {
  return (
    <div className="User-Management-Container">
      <div className="UserManagement-TopRow">
        <div className="UserManagement-SearchBarRow">
          <input
            className="UserManagement-SearchBar"
            type="text"
            placeholder="Enter Keyword"
            disabled
          />
          <button className="UserManagement-SearchButton" disabled>SEARCH</button>
        </div>
      </div>
      <div className="UserManagement-TableOuter">
        <div className="UserManagement-TableWrapper">
          <table className="UserManagement-Table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Reactivate/Deactivate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ADM00002</td>
                <td>Jonathan Rasgo</td>
                <td>Administrator</td>
                <td><span className="UserManagement-Status-Deactivated">Deactivated</span></td>
                <td><button className="UserManagement-Reactivate">Reactivate</button></td>
              </tr>
              <tr>
                <td>DCM00011</td>
                <td>Sophia Alfonso</td>
                <td>Document Manager</td>
                <td><span className="UserManagement-Status-Activated">Activated</span></td>
                <td><button className="UserManagement-Deactivate">Deactivate</button></td>
              </tr>
              <tr>
                <td>IA00022</td>
                <td>Christel Delgado</td>
                <td>Information Access Officer</td>
                <td><span className="UserManagement-Status-Activated">Activated</span></td>
                <td><button className="UserManagement-Deactivate">Deactivate</button></td>
              </tr>
              {Array.from({ length: 18 }).map((_, idx) => (
                <tr key={idx}>
                  <td>IA{String(22 + idx).padStart(5, '0')}</td>
                  <td>User {idx + 1}</td>
                  <td>Information Access Officer</td>
                  <td><span className="UserManagement-Status-Activated">Activated</span></td>
                  <td><button className="UserManagement-Deactivate">Deactivate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="UserManagement-AddUserRow">
          <button className="UserManagement-AddUser">ADD USER</button>
        </div>
      </div>
    </div>
  );
}



