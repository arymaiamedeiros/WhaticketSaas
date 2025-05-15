import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";
import { loadImageWithCors } from "../../utils/imageUtils";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
}));

const ModalImageCors = ({ imageUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");
	const isMounted = useRef(true);

	useEffect(() => {
		// Configurar o componente como montado
		isMounted.current = true;
		
		return () => {
			// Marcar o componente como desmontado quando for removido
			isMounted.current = false;
			
			// Limpar URLs de blob existentes
			if (blobUrl && blobUrl.startsWith('blob:')) {
				URL.revokeObjectURL(blobUrl);
			}
		};
	}, []);

	useEffect(() => {
		if (!imageUrl) return;
		
		let isCancelled = false;
		
		const fetchImage = async () => {
			try {
				const processedUrl = await loadImageWithCors(imageUrl);
				
				// Verificar se o componente ainda está montado antes de atualizar o estado
				if (isMounted.current && !isCancelled) {
					setBlobUrl(processedUrl);
					setFetching(false);
				}
			} catch (error) {
				console.error("Erro ao carregar imagem:", error);
				
				// Verificar se o componente ainda está montado antes de atualizar o estado
				if (isMounted.current && !isCancelled) {
					setBlobUrl(imageUrl || "");
					setFetching(false);
				}
			}
		};
		
		fetchImage();
		
		// Função de limpeza para cancelar operações pendentes
		return () => {
			isCancelled = true;
		};
	}, [imageUrl]);

	return (
		<ModalImage
			className={classes.messageMedia}
			smallSrcSet={fetching ? (imageUrl || "") : blobUrl}
			medium={fetching ? (imageUrl || "") : blobUrl}
			large={fetching ? (imageUrl || "") : blobUrl}
			alt="image"
		/>
	);
};

export default ModalImageCors;
