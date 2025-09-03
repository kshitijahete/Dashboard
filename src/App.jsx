import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import "./App.css";


ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://6874ce63dd06792b9c954fc7.mockapi.io/api/v1/users"
      );
      const users = await res.json();
      setData(users);
    };
    fetchData();
  }, []);

  const totalUsers = data.length;

  const last30Days = [...Array(30).keys()].map((i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  const usersByDate = last30Days.map((day) =>
    data.filter((user) => user.createdAt?.startsWith(day)).length
  );

  const lineData = {
    labels: last30Days,
    datasets: [
      {
        label: "Users Created",
        data: usersByDate,
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const withAvatar = data.filter((u) => u.avatar).length;
  const withoutAvatar = totalUsers - withAvatar;

  const pieData = {
    labels: ["With Avatar", "Without Avatar"],
    datasets: [
      {
        data: [withAvatar, withoutAvatar],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverOffset: 10,
      },
    ],
  };

  const recentUsers = [...data]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  let filtered = data.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "date") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="dashboard">
      {/* Top Navbar */}
      <header className="topbar">
        <h1 className="logo">Admin Dashboard</h1>
        <div className="top-actions">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="profile">
            <span>Admin</span>
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="Admin"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard Tiles */}
        <div className="tiles">
          <div className="tile">Total Users: {totalUsers}</div>
          <div className="tile">Users With Avatar: {withAvatar}</div>
          <div className="tile">Users Without Avatar: {withoutAvatar}</div>
        </div>

        {/* Charts */}
        <div className="charts">
          <div className="chart card">
            <h3>Users Created Per Day</h3>
            <Line data={lineData} />
          </div>
          <div className="chart card">
            <h3>Avatar Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>

        {/* Recently Joined */}
        <h3>Recently Joined</h3>
        <div className="recent-users">
          {recentUsers.map((user) => (
            <div className="user-card" key={user.id}>
              <img src={user.avatar} alt={user.name} />
              <p>{user.name}</p>
            </div>
          ))}
        </div>

        {/* User Table */}
        <div className="controls">
          <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user.id} onClick={() => setSelectedUser(user)}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>Next</button>
        </div>

        {/* Modal */}
        {selectedUser && (
          <div className="modal" onClick={() => setSelectedUser(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>User Details</h3>
              <img src={selectedUser.avatar} alt={selectedUser.name} />
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <button onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;