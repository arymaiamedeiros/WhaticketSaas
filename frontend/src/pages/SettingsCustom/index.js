import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Tabs, Tab } from "@mui/material";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import TabPanel from "../../components/TabPanel";
import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";

const Root = styled("div")(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.background.paper,
}));

const MainPaper = styled(Paper)(({ theme }) => ({
  ...theme.scrollbarStyles,
  overflowY: "scroll",
  flex: 1,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.options,
  borderRadius: 4,
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  ...theme.scrollbarStyles,
  overflowY: "scroll",
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  width: "100%",
}));

const Container = styled("div")({
  width: "100%",
  maxHeight: "100%",
});

const SettingsCustom = () => {
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find(
            (d) => d.key === "scheduleType"
          );
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        }

        const user = await getCurrentUserInfo();
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>
      <MainPaper elevation={1}>
        <StyledTabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          onChange={handleTabChange}
        >
          <Tab label="Opções" value={"options"} />
          {schedulesEnabled && <Tab label="Horários" value={"schedules"} />}
          {isSuper() ? <Tab label="Empresas" value={"companies"} /> : null}
          {isSuper() ? <Tab label="Planos" value={"plans"} /> : null}
          {isSuper() ? <Tab label="Ajuda" value={"helps"} /> : null}
        </StyledTabs>
        <ContentPaper elevation={0}>
          <TabPanel value={tab} name={"schedules"}>
            <Container>
              <SchedulesForm
                loading={loading}
                onSubmit={handleSubmitSchedules}
                initialValues={schedules}
              />
            </Container>
          </TabPanel>
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel value={tab} name={"companies"}>
                <Container>
                  <CompaniesManager />
                </Container>
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel value={tab} name={"plans"}>
                <Container>
                  <PlansManager />
                </Container>
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel value={tab} name={"helps"}>
                <Container>
                  <HelpsManager />
                </Container>
              </TabPanel>
            )}
          />
          <TabPanel value={tab} name={"options"}>
            <Container>
              <Options
                settings={settings}
                scheduleTypeChanged={(value) =>
                  setSchedulesEnabled(value === "company")
                }
              />
            </Container>
          </TabPanel>
        </ContentPaper>
      </MainPaper>
    </MainContainer>
  );
};

export default SettingsCustom;
