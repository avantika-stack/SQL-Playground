import React, {
  useState,
  FC,
  useEffect,
  useRef,
  useCallback,
  RefCallback,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TextInputComponent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  DynamicStyleSheet,
  DynamicValue,
  useDynamicValue,
} from 'react-native-dynamic';

import GestureRecognizer from 'react-native-swipe-gestures';

import {lightDark, sideButton} from '../data/colors.json';
import {findUserCommands, getLastUserCommand} from '../utils/storage';
import {debounce} from '../utils/utils';
interface Props {
  inputValue: string;
  setInputValue: (val: string) => void;
}

const InputContainer: FC<Props> = ({inputValue, setInputValue}) => {
  const historyOffset = useRef<number>(-1);
  const [autoCompleteTxt, setAutoCompleteTxt] = useState<string>('');

  const onUpArrowPress = async () => {
    const lastCommand = await getLastUserCommand(historyOffset.current + 1);
    // console.log(historyOffset.current + 1, lastCommand);

    // only set if command is there
    if (lastCommand) {
      setInputValue(lastCommand);
      historyOffset.current++;
    }
  };
  const onDownArrowPress = async () => {
    if (historyOffset.current === 0) return; // do nothing if offset it 0

    const lastCommand = await getLastUserCommand(historyOffset.current - 1);
    // console.log(historyOffset.current - 1, lastCommand);
    // only set if command is there
    if (lastCommand) {
      setInputValue(lastCommand);
      historyOffset.current--;
    }
  };

  type CallbackType = (...args: string[]) => void;

  const getAutoComplete = useCallback<CallbackType>(
    debounce((val: string) =>
      findUserCommands(val).then((e) => {
        console.log('autocomplete', e);
        setAutoCompleteTxt(e);
      }),
    ),
    [],
  );

  useEffect(() => {
    console.log(inputValue);

    if (inputValue !== '') {
      getAutoComplete(inputValue);
    } else {
      setAutoCompleteTxt('');
    }
  }, [inputValue]);

  const styles = useDynamicValue(dynamicStyles);
  return (
    <View>
      <Text style={styles.inputHeader}>Type your SQL Query</Text>
      <GestureRecognizer onSwipeRight={() => setInputValue(autoCompleteTxt)}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setInputValue(text)}
            multiline
            placeholderTextColor="gray"
            textAlignVertical="top"
            value={inputValue}
            autoCorrect={false}
            numberOfLines={4}
            placeholder="Type your SQL query"
          />
          <Text style={styles.autoCompleteTxt}>{autoCompleteTxt}</Text>
        </View>
      </GestureRecognizer>

      <View style={styles.sideButtonContainer}>
        <TouchableOpacity onPress={onUpArrowPress}>
          <Icon size={30} name="arrow-up-bold-box" color={sideButton} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.downArrow} onPress={onDownArrowPress}>
          <Icon size={30} name="arrow-up-bold-box" color={sideButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setInputValue('')}>
          <Icon size={30} name="text-box-remove" color={sideButton} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InputContainer;

const dynamicStyles = new DynamicStyleSheet({
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    paddingRight: 25,
    marginBottom: 10,
    marginTop: 10,
    opacity: 1,
    height: 120,
    color: new DynamicValue('black', 'white'),
    backgroundColor: new DynamicValue('white', lightDark),
  },
  inputHeader: {
    fontSize: 16,
    color: new DynamicValue('black', 'white'),
  },
  inputContainer: {
    position: 'relative',
  },
  autoCompleteTxt: {
    position: 'absolute',
    fontFamily: 'monospace',
    fontSize: 16,
    color: 'gray',
    top: 20,
    left: 4,
    opacity: 0.8,
  },
  sideButtonContainer: {
    position: 'absolute',
    bottom: 12,
    right: 3,
  },
  downArrow: {
    transform: [{rotate: '180deg'}],
    marginTop: -5,
    marginBottom: -5,
  },
  deleteBtn: {
    // position: 'absolute',
    // bottom: 12,
    // right: 3,
  },
});
