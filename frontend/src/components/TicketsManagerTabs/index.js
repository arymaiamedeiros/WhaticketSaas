import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { styled } from '@mui/material/styles';
import {
  Paper,
  Tabs,
  Tab,
  Badge,
  FormControlLabel,
  Switch,
  Button,
  InputBase,
  Box
} from "@mui/material";
import {
  Search as SearchIcon,
  MoveToInbox as MoveToInboxIcon,
  CheckBox as CheckBoxIcon
} from "@mui/icons-material";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";

const TicketsWrapper = styled(Paper)(({ theme }) => ({
	position: "relative",
	display: "flex",
	height: "100%",
	flexDirection: "column",
	overflow: "hidden",
	borderTopRightRadius: 0,
	borderBottomRightRadius: 0,
	borderRadius: 0,
}));

const TabsHeader = styled(Paper)(({ theme }) => ({
	flex: "none",
	backgroundColor: theme.palette.tabHeaderBackground,
}));

const TabsInternal = styled(Paper)(({ theme }) => ({
	flex: "none",
	backgroundColor: theme.palette.tabHeaderBackground
}));

const StyledTab = styled(Tab)({
	minWidth: 120,
	width: 120,
});

const InternalTab = styled(Tab)({
	minWidth: 120,
	width: 120,
	padding: 5
});

const TicketOptionsBox = styled(Box)(({ theme }) => ({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	background: theme.palette.optionsBackground,
	padding: theme.spacing(1),
}));

const TicketSearchLine = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1),
}));

const SearchInputWrapper = styled(Box)(({ theme }) => ({
	flex: 1,
	background: theme.palette.total,
	display: "flex",
	borderRadius: 40,
	padding: 4,
	marginRight: theme.spacing(1),
}));

const SearchIconWrapper = styled(Box)({
	color: "grey",
	marginLeft: 6,
	marginRight: 6,
	alignSelf: "center",
});

const SearchInput = styled(InputBase)({
	flex: 1,
	border: "none",
	borderRadius: 30,
});

const InsiderTabPanel = styled(Box)({
	height: '100%',
	marginTop: "-72px",
	paddingTop: "72px"
});

const InsiderDoubleTabPanel = styled(Box)({
	display: "flex",
	flexDirection: "column",
	marginTop: "-72px",
	paddingTop: "72px",
	height: "100%"
});

const LabelContainer = styled(Box)({
	width: "auto",
	padding: 0
});

const IconLabelWrapper = styled(Box)({
	flexDirection: "row",
	'& > *:first-child': {
		marginBottom: '3px !important',
		marginRight: 16
	}
});

const InsiderTabLabel = styled(Box)(({ theme }) => ({
	[theme.breakpoints.down(1600)]: {
		display: 'none'
	}
}));

const SmallFormControl = styled(Box)({
	'& .MuiOutlinedInput-input': {
		padding: "12px 10px",
	},
	'& .MuiInputLabel-outlined': {
		marginTop: "-6px"
	}
});

const TicketsManagerTabs = () => {
	const history = useHistory();
	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [tabOpen, setTabOpen] = useState("open");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);
	const searchInputRef = useRef();
	const { user } = useContext(AuthContext);
	const { profile } = user;

	const [openCount, setOpenCount] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);

	const userQueueIds = user.queues.map((q) => q.id);
	const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
	const [selectedTags, setSelectedTags] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);

	useEffect(() => {
		if (user.profile.toUpperCase() === "ADMIN") {
			setShowAllTickets(true);
		}
	}, []);

	useEffect(() => {
		if (tab === "search") {
			searchInputRef.current.focus();
		}
	}, [tab]);

	let searchTimeout;

	const handleSearch = (e) => {
		const searchedTerm = e.target.value.toLowerCase();

		clearTimeout(searchTimeout);

		if (searchedTerm === "") {
			setSearchParam(searchedTerm);
			setTab("open");
			return;
		}

		searchTimeout = setTimeout(() => {
			setSearchParam(searchedTerm);
		}, 500);
	};

	const handleChangeTab = (e, newValue) => {
		setTab(newValue);
	};

	const handleChangeTabOpen = (e, newValue) => {
		setTabOpen(newValue);
	};

	const applyPanelStyle = (status) => {
		if (tabOpen !== status) {
			return { width: 0, height: 0 };
		}
	};

	const handleCloseOrOpenTicket = (ticket) => {
		setNewTicketModalOpen(false);
		if (ticket !== undefined && ticket.uuid !== undefined) {
			history.push(`/tickets/${ticket.uuid}`);
		}
	};

	const handleSelectedTags = (selecteds) => {
		const tags = selecteds.map((t) => t.id);
		setSelectedTags(tags);
	};

	const handleSelectedUsers = (selecteds) => {
		const users = selecteds.map((t) => t.id);
		setSelectedUsers(users);
	};

	return (
		<TicketsWrapper elevation={0} variant="outlined">
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={(ticket) => {
					handleCloseOrOpenTicket(ticket);
				}}
			/>
			<TabsHeader elevation={0} square>
				<Tabs
					value={tab}
					onChange={handleChangeTab}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="icon label tabs example"
				>
					<StyledTab
						value={"open"}
						icon={<MoveToInboxIcon />}
						label={i18n.t("tickets.tabs.open.title")}
					/>
					<StyledTab
						value={"closed"}
						icon={<CheckBoxIcon />}
						label={i18n.t("tickets.tabs.closed.title")}
					/>
					<StyledTab
						value={"search"}
						icon={<SearchIcon />}
						label={i18n.t("tickets.tabs.search.title")}
					/>
				</Tabs>
			</TabsHeader>
			<TicketOptionsBox>
				<SearchInputWrapper>
					<SearchIconWrapper>
						<SearchIcon />
					</SearchIconWrapper>
					<SearchInput
						inputRef={searchInputRef}
						placeholder={i18n.t("tickets.search.placeholder")}
						type="search"
						onChange={handleSearch}
					/>
				</SearchInputWrapper>
				<Can
					role={user.profile}
					perform="tickets:create"
					yes={() => (
						<Button
							variant="contained"
							color="primary"
							onClick={() => setNewTicketModalOpen(true)}
						>
							{i18n.t("tickets.buttons.newTicket")}
						</Button>
					)}
				/>
			</TicketOptionsBox>
			<TicketSearchLine>
				<TicketsQueueSelect
					style={{ marginLeft: 6 }}
					selectedQueueIds={selectedQueueIds}
					userQueues={user?.queues}
					onChange={(values) => setSelectedQueueIds(values)}
				/>
				<TagsFilter onFiltered={handleSelectedTags} />
				<UsersFilter onFiltered={handleSelectedUsers} />
				<Can
					role={user.profile}
					perform="tickets:showall"
					yes={() => (
						<FormControlLabel
							label={i18n.t("tickets.buttons.showAll")}
							labelPlacement="start"
							control={
								<Switch
									size="small"
									checked={showAllTickets}
									onChange={() =>
										setShowAllTickets((prevState) => !prevState)
									}
									name="showAllTickets"
									color="primary"
								/>
							}
						/>
					)}
				/>
			</TicketSearchLine>
			<TabPanel value={tab} name="open" className={InsiderTabPanel}>
				<TabsInternal elevation={0} square>
					<Tabs
						value={tabOpen}
						onChange={handleChangeTabOpen}
						variant="fullWidth"
						indicatorColor="primary"
						textColor="primary"
						aria-label="icon label tabs example"
					>
						<InternalTab
							value={"open"}
							label={
								<Badge badgeContent={openCount} color="primary">
									{i18n.t("tickets.tabs.open.list")}
								</Badge>
							}
						/>
						<InternalTab
							value={"pending"}
							label={
								<Badge badgeContent={pendingCount} color="secondary">
									{i18n.t("tickets.tabs.pending.list")}
								</Badge>
							}
						/>
					</Tabs>
				</TabsInternal>
				<TabPanel value={tabOpen} name="open" className={InsiderDoubleTabPanel}>
					<TicketsList
						status="open"
						showAll={showAllTickets}
						selectedQueueIds={selectedQueueIds}
						tags={selectedTags}
						users={selectedUsers}
						searchParam={searchParam}
					/>
				</TabPanel>
				<TabPanel value={tabOpen} name="pending" className={InsiderDoubleTabPanel}>
					<TicketsList
						status="pending"
						showAll={showAllTickets}
						selectedQueueIds={selectedQueueIds}
						tags={selectedTags}
						users={selectedUsers}
						searchParam={searchParam}
					/>
				</TabPanel>
			</TabPanel>
			<TabPanel value={tab} name="closed" className={InsiderTabPanel}>
				<TicketsList
					status="closed"
					showAll={true}
					selectedQueueIds={selectedQueueIds}
					tags={selectedTags}
					users={selectedUsers}
					searchParam={searchParam}
				/>
			</TabPanel>
			<TabPanel value={tab} name="search" className={InsiderTabPanel}>
				<TicketsList
					status="search"
					showAll={true}
					selectedQueueIds={selectedQueueIds}
					tags={selectedTags}
					users={selectedUsers}
					searchParam={searchParam}
				/>
			</TabPanel>
		</TicketsWrapper>
	);
};

export default TicketsManagerTabs;
