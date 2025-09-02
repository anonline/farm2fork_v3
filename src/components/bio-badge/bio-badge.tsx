import { CONFIG } from 'src/global-config';

type BioBadgeSvgProps = {
    style: React.CSSProperties;
};

export default function BioBadge(props: BioBadgeSvgProps) {
    return (
        <img
            style={props.style}
            src={`${CONFIG.assetsDir}/assets/icons/BIO.svg`}
            width={45}
            height={24}
        />
    );
}
