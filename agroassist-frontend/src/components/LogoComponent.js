import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path, G} from 'react-native-svg';
import {colors} from '../styles/globalStyles';

const LogoComponent = ({size = 80, color = colors.text.onPrimary}) => {
  return (
    <View style={{
      width: size,
      height: size,
      backgroundColor: color === colors.text.onPrimary ? 'rgba(255,255,255,0.2)' : 'transparent',
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        <G>
          {/* Hoja principal */}
          <Path
            d="M12,2L12,2C15.3,2 18,4.7 18,8C18,11.3 15.3,14 12,14L12,14C8.7,14 6,11.3 6,8C6,4.7 8.7,2 12,2Z"
            fill={color}
            opacity={0.9}
          />
          
          {/* Hoja secundaria */}
          <Path
            d="M9,7L9,7C10.7,7 12,8.3 12,10C12,11.7 10.7,13 9,13L9,13C7.3,13 6,11.7 6,10C6,8.3 7.3,7 9,7Z"
            fill={color}
            opacity={0.7}
          />
          
          {/* Tallo */}
          <Path
            d="M12,14L12,22"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Nervadura de la hoja */}
          <Path
            d="M12,2L12,14"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            opacity={0.6}
          />
          
          {/* Nervaduras secundarias */}
          <Path
            d="M9,5L12,8"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            opacity={0.4}
          />
          
          <Path
            d="M15,5L12,8"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            opacity={0.4}
          />
        </G>
      </Svg>
    </View>
  );
};

export default LogoComponent;
