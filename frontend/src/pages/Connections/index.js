import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Box,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Tooltip,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
	Root,
	MainPaper,
	TooltipPopper,
	ButtonProgress,
	StyledTableCell,
	StyledTableRow,
} from './styles';
import { listWhatsApps, deleteWhatsApp } from '../../store/modules/whatsapp/actions';
import WhatsAppModal from './WhatsAppModal';
import DeleteModal from './DeleteModal';
import QrCodeModal from './QrCodeModal';

const Connections = () => {
	const dispatch = useDispatch();
	const { whatsApps, loading } = useSelector((state) => state.whatsapp);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);

	useEffect(() => {
		dispatch(listWhatsApps());
	}, [dispatch]);

	const handleOpenWhatsAppModal = () => {
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = () => {
		setWhatsAppModalOpen(false);
	};

	const handleOpenDeleteModal = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setDeleteModalOpen(true);
	};

	const handleCloseDeleteModal = () => {
		setDeleteModalOpen(false);
		setSelectedWhatsApp(null);
	};

	const handleOpenQrCodeModal = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setQrCodeModalOpen(true);
	};

	const handleCloseQrCodeModal = () => {
		setQrCodeModalOpen(false);
		setSelectedWhatsApp(null);
	};

	const handleDeleteWhatsApp = async () => {
		try {
			await dispatch(deleteWhatsApp(selectedWhatsApp.id));
			toast.success('WhatsApp excluído com sucesso!');
			handleCloseDeleteModal();
		} catch (err) {
			toast.error('Erro ao excluir WhatsApp!');
		}
	};

	return (
		<Root>
			<Box display="flex" justifyContent="flex-end" mb={2}>
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={handleOpenWhatsAppModal}
				>
					Adicionar WhatsApp
				</Button>
			</Box>

			<MainPaper>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<StyledTableCell>Nome</StyledTableCell>
								<StyledTableCell>Status</StyledTableCell>
								<StyledTableCell>Ações</StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={3} align="center">
										<CircularProgress size={24} />
									</TableCell>
								</TableRow>
							) : (
								whatsApps.map((whatsApp) => (
									<StyledTableRow key={whatsApp.id}>
										<StyledTableCell>{whatsApp.name}</StyledTableCell>
										<StyledTableCell>{whatsApp.status}</StyledTableCell>
										<StyledTableCell>
											<Box display="flex" gap={1}>
												<Tooltip title="Ver QR Code" PopperComponent={TooltipPopper}>
													<IconButton
														size="small"
														onClick={() => handleOpenQrCodeModal(whatsApp)}
													>
														<QrCodeIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Excluir" PopperComponent={TooltipPopper}>
													<IconButton
														size="small"
														onClick={() => handleOpenDeleteModal(whatsApp)}
													>
														<DeleteIcon />
													</IconButton>
												</Tooltip>
											</Box>
										</StyledTableCell>
									</StyledTableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</MainPaper>

			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
			/>

			<DeleteModal
				open={deleteModalOpen}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteWhatsApp}
				whatsApp={selectedWhatsApp}
			/>

			<QrCodeModal
				open={qrCodeModalOpen}
				onClose={handleCloseQrCodeModal}
				whatsApp={selectedWhatsApp}
			/>
		</Root>
	);
};

export default Connections;
