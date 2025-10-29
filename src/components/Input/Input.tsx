import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants';
import { styles } from './Input.styles';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  secureTextEntry,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const isPassword = secureTextEntry;

  const handleRightIconPress = () => {
    if (isPassword) {
      setIsSecure(!isSecure);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getRightIcon = () => {
    if (isPassword) {
      return isSecure ? 'eye-off-outline' : 'eye-outline';
    }
    return rightIcon;
  };

  const getIconSymbol = (iconName?: string) => {
    switch (iconName) {
      case 'mail-outline':
        return '✉';
      case 'lock-closed-outline':
        return '🔒';
      case 'eye-outline':
        return '👁';
      case 'eye-off-outline':
        return '🙈';
      case 'person-outline':
        return '👤';
      case 'phone-outline':
      case 'call-outline':
        return '📞';
      case 'search-outline':
        return '🔍';
      default:
        return '•';
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <Text style={[
            styles.iconText,
            {
              color: hasError ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray400
            }
          ]}>
            {getIconSymbol(leftIcon)}
          </Text>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={COLORS.gray400}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {(rightIcon || isPassword) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={styles.rightIcon}
          >
            <Text style={[
              styles.iconText,
              {
                color: hasError ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray400
              }
            ]}>
              {getIconSymbol(getRightIcon())}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {hasError && (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};