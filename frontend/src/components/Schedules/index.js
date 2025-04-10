import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import "./Schedules.css";

const Schedules = () => {
    const history = useHistory();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [searchParam, setSearchParam] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        loadSchedules();
    }, [pageNumber, searchParam]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/schedules", {
                params: { searchParam, pageNumber }
            });
            setSchedules(data.schedules);
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    const handleOpenModal = (schedule = null) => {
        setSelectedSchedule(schedule);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSchedule(null);
        setModalOpen(false);
    };

    const handleSaveSchedule = async (scheduleData) => {
        try {
            if (selectedSchedule) {
                await api.put(`/schedules/${selectedSchedule.id}`, scheduleData);
                toast.success(i18n.t("schedules.toasts.updated"));
            } else {
                await api.post("/schedules", scheduleData);
                toast.success(i18n.t("schedules.toasts.created"));
            }
            handleCloseModal();
            loadSchedules();
        } catch (err) {
            toastError(err);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            await api.delete(`/schedules/${scheduleId}`);
            toast.success(i18n.t("schedules.toasts.deleted"));
            loadSchedules();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <div className="schedules-container">
            <div className="schedules-header">
                <h1 className="schedules-title">{i18n.t("schedules.title")}</h1>
                <div className="schedules-actions">
                    <button
                        className="schedules-button schedules-button-primary"
                        onClick={() => handleOpenModal()}
                    >
                        {i18n.t("schedules.buttons.new")}
                    </button>
                </div>
            </div>

            <div className="schedules-search">
                <input
                    type="text"
                    className="schedules-search-input"
                    placeholder={i18n.t("schedules.searchPlaceholder")}
                    value={searchParam}
                    onChange={(e) => setSearchParam(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="schedules-loading">
                    <div className="schedules-loading-spinner" />
                </div>
            ) : (
                <>
                    <div className="schedules-responsive-table">
                        <table className="schedules-table">
                            <thead>
                                <tr>
                                    <th>{i18n.t("schedules.table.name")}</th>
                                    <th>{i18n.t("schedules.table.status")}</th>
                                    <th>{i18n.t("schedules.table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td>{schedule.name}</td>
                                        <td>
                                            <span className={`schedules-status schedules-status-${schedule.status}`}>
                                                {i18n.t(`schedules.status.${schedule.status}`)}
                                            </span>
                                        </td>
                                        <td className="schedules-actions-cell">
                                            <button
                                                className="schedules-icon-button"
                                                onClick={() => handleOpenModal(schedule)}
                                            >
                                                <i className="schedules-icon">✏️</i>
                                            </button>
                                            <button
                                                className="schedules-icon-button"
                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                            >
                                                <i className="schedules-icon">🗑️</i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {schedules.length === 0 && !loading && (
                        <div className="schedules-empty">
                            <div className="schedules-empty-icon">📅</div>
                            <div className="schedules-empty-text">
                                {i18n.t("schedules.empty")}
                            </div>
                        </div>
                    )}

                    <div className="schedules-pagination">
                        <button
                            className="schedules-pagination-button"
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber === 1}
                        >
                            {i18n.t("schedules.buttons.previous")}
                        </button>
                        <button
                            className="schedules-pagination-button"
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={!hasMore}
                        >
                            {i18n.t("schedules.buttons.next")}
                        </button>
                    </div>
                </>
            )}

            {modalOpen && (
                <div className="schedules-dialog">
                    <div className="schedules-dialog-content">
                        <div className="schedules-dialog-header">
                            <h2 className="schedules-dialog-title">
                                {selectedSchedule
                                    ? i18n.t("schedules.dialog.editTitle")
                                    : i18n.t("schedules.dialog.newTitle")}
                            </h2>
                            <button
                                className="schedules-dialog-close"
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="schedules-dialog-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    handleSaveSchedule({
                                        name: formData.get("name"),
                                        status: formData.get("status")
                                    });
                                }}
                            >
                                <div className="schedules-form-group">
                                    <label className="schedules-form-label">
                                        {i18n.t("schedules.form.name")}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="schedules-form-input"
                                        defaultValue={selectedSchedule?.name}
                                        required
                                    />
                                </div>
                                <div className="schedules-form-group">
                                    <label className="schedules-form-label">
                                        {i18n.t("schedules.form.status")}
                                    </label>
                                    <select
                                        name="status"
                                        className="schedules-form-input"
                                        defaultValue={selectedSchedule?.status || "active"}
                                        required
                                    >
                                        <option value="active">
                                            {i18n.t("schedules.status.active")}
                                        </option>
                                        <option value="inactive">
                                            {i18n.t("schedules.status.inactive")}
                                        </option>
                                    </select>
                                </div>
                                <div className="schedules-dialog-footer">
                                    <button
                                        type="button"
                                        className="schedules-button schedules-button-secondary"
                                        onClick={handleCloseModal}
                                    >
                                        {i18n.t("schedules.buttons.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="schedules-button schedules-button-primary"
                                    >
                                        {i18n.t("schedules.buttons.save")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedules; 