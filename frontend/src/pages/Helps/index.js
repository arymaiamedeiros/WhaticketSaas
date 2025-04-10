import React, { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Modal } from "@mui/material";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const MainPaperContainer = styled("div")({
  overflowY: "auto",
  maxHeight: "calc(100vh - 200px)",
});

const MainPaper = styled("div")(({ theme }) => ({
  width: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const HelpPaper = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  minHeight: "340px",
  padding: theme.spacing(2),
  boxShadow: theme.shadows[3],
  borderRadius: theme.spacing(1),
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  maxWidth: "340px",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: `0 0 8px ${theme.palette.primary.main}`,
  },
}));

const VideoThumbnail = styled("img")(({ theme }) => ({
  width: "100%",
  height: "calc(100% - 56px)",
  objectFit: "cover",
  borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0`,
}));

const VideoTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  flex: 1,
}));

const VideoDescription = styled(Typography)({
  maxHeight: "100px",
  overflow: "hidden",
});

const VideoModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const VideoModalContent = styled("div")(({ theme }) => ({
  outline: "none",
  width: "90%",
  maxWidth: 1024,
  aspectRatio: "16/9",
  position: "relative",
  backgroundColor: "white",
  borderRadius: theme.spacing(1),
  overflow: "hidden",
}));

const Helps = () => {
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <VideoModal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
      >
        <VideoModalContent>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </VideoModalContent>
      </VideoModal>
    );
  };

  const renderHelps = () => {
    return (
      <MainPaperContainer>
        <MainPaper>
          {records.length ? records.map((record, key) => (
            <HelpPaper key={key} onClick={() => openVideoModal(record.video)}>
              <VideoThumbnail
                src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                alt="Thumbnail"
              />
              <VideoTitle variant="button">
                {record.title}
              </VideoTitle>
              <VideoDescription variant="caption">
                {record.description}
              </VideoDescription>
            </HelpPaper>
          )) : null}
        </MainPaper>
      </MainPaperContainer>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("helps.title")} ({records.length})</Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>
      {renderHelps()}
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;
