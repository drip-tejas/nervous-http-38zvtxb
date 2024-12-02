import React, { useState, useEffect } from "react";
import axios from "axios";

const QRCodeList = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [filters, setFilters] = useState({
    searchText: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchQrCodes = async () => {
      const response = await axios.get("/api/qr", { params: filters });
      setQrCodes(response.data);
    };
    fetchQrCodes();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedQrCodes = qrCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <h1>QR Codes</h1>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={filters.searchText}
          onChange={(e) => handleFilterChange("searchText", e.target.value)}
        />
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
        >
          <option value="createdAt">Created At</option>
          <option value="scans">Scans</option>
        </select>
        <select
          value={filters.sortDirection}
          onChange={(e) => handleFilterChange("sortDirection", e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Identifier</th>
            <th>Target URL</th>
            <th>Scans</th>
          </tr>
        </thead>
        <tbody>
          {paginatedQrCodes.map((qrCode) => (
            <tr key={qrCode.uniqueIdentifier}>
              <td>{qrCode.uniqueIdentifier}</td>
              <td>{qrCode.targetUrl}</td>
              <td>{qrCode.scans.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {[...Array(Math.ceil(qrCodes.length / itemsPerPage)).keys()].map(
          (page) => (
            <button
              key={page + 1}
              onClick={() => handlePageChange(page + 1)}
              disabled={currentPage === page + 1}
            >
              {page + 1}
            </button>
          )
        )}
      </div>
      <button>Generate New QR Code</button>
    </div>
  );
};

export default QRCodeList;
