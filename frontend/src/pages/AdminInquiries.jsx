import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import api from "../api/axios";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const response = await api.get("/inquiries");

      setInquiries(response.data.inquiries || []);
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}/status`, {
        status,
      });

      fetchInquiries();

      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => ({
          ...prev,
          status,
        }));
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update inquiry status"
      );
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm("Delete this inquiry?")) {
      return;
    }

    try {
      await api.delete(`/inquiries/${id}`);
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete inquiry"
      );
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) =>
    `${inquiry.name} ${inquiry.email} ${inquiry.subject} ${inquiry.message} ${inquiry.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getStatusClass = (status) => {
    return `inquiry-status ${status}`;
  };

  return (
    <div className="admin-page">

      {/* =====================================================
          ADMIN INQUIRIES HEADER
          ===================================================== */}

      <div className="admin-page-header">
        <div>
          <h1>Inquiries</h1>
          <p>
            Manage customer questions and website inquiries.
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="admin-search-box inquiry-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search inquiries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =====================================================
          INQUIRIES TABLE
          ===================================================== */}

      {loading ? (
        <div className="admin-empty-state">
          Loading inquiries...
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="admin-empty-state">
          No inquiries found.
        </div>
      ) : (
        <div className="admin-inquiries-wrapper">
          <div className="admin-inquiries-table">

            <div className="inquiry-table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Subject</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredInquiries.map((inquiry) => (
              <div
                className="inquiry-table-row"
                key={inquiry.id}
              >
                <div className="inquiry-name">
                  {inquiry.name}
                </div>

                <div className="inquiry-email">
                  {inquiry.email}
                </div>

                <div className="inquiry-subject">
                  {inquiry.subject || "No subject"}
                </div>

                <div>
                  <span
                    className={getStatusClass(inquiry.status)}
                  >
                    {inquiry.status}
                  </span>
                </div>

                <div className="inquiry-actions">
                  <button
                    className="inquiry-view-btn"
                    onClick={() =>
                      setSelectedInquiry(inquiry)
                    }
                    title="View"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    className="inquiry-delete-btn"
                    onClick={() =>
                      deleteInquiry(inquiry.id)
                    }
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================
          INQUIRY DETAILS MODAL
          ===================================================== */}

      {selectedInquiry && (
        <div className="admin-modal-overlay">
          <div className="admin-modal inquiry-modal">

            <div className="admin-modal-header">
              <div>
                <h2>Inquiry Details</h2>
                <p>
                  View and manage customer inquiry.
                </p>
              </div>

              <button
                className="admin-close-btn"
                onClick={() => setSelectedInquiry(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="inquiry-details">

              <div className="inquiry-detail-item">
                <span>Name</span>
                <strong>{selectedInquiry.name}</strong>
              </div>

              <div className="inquiry-detail-item">
                <span>Email</span>
                <strong>{selectedInquiry.email}</strong>
              </div>

              <div className="inquiry-detail-item">
                <span>Phone</span>
                <strong>
                  {selectedInquiry.phone || "Not provided"}
                </strong>
              </div>

              <div className="inquiry-detail-item">
                <span>Subject</span>
                <strong>
                  {selectedInquiry.subject || "No subject"}
                </strong>
              </div>

              <div className="inquiry-message">
                <span>Message</span>
                <p>{selectedInquiry.message}</p>
              </div>

              <div className="inquiry-detail-item">
                <span>Status</span>

                <span
                  className={getStatusClass(
                    selectedInquiry.status
                  )}
                >
                  {selectedInquiry.status}
                </span>
              </div>

              <div className="inquiry-status-actions">
                <button
                  onClick={() =>
                    updateStatus(
                      selectedInquiry.id,
                      "read"
                    )
                  }
                  className="inquiry-status-btn"
                >
                  Mark Read
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedInquiry.id,
                      "replied"
                    )
                  }
                  className="inquiry-status-btn success"
                >
                  <CheckCircle size={15} />
                  Replied
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedInquiry.id,
                      "closed"
                    )
                  }
                  className="inquiry-status-btn dark"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-delete-btn"
                onClick={() =>
                  deleteInquiry(selectedInquiry.id)
                }
              >
                <Trash2 size={16} />
                Delete Inquiry
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;