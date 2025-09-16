import { CONFIG } from 'src/global-config';

type BioBadgeSvgProps = {
    style?: React.CSSProperties;
    width?: number;
    height?: number;
};

export default function BioBadge(props: BioBadgeSvgProps) {
    return (
        <img
            style={props.style}
            src={`${CONFIG.assetsDir}/assets/icons/BIO.svg`}
            width={props.width || 45}
            height={props.height || 24}
        />
    );
}
