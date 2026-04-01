import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';


const AgreementModal = ({ visible, onClose, onAgree, callback,callback2,callback3,callback4 }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleAgree = () => {
        // if (isChecked) {
        //     onAgree();
        //     onClose();
        // } else {
        //     // 可以在这里添加一个提示,告诉用户需要先同意条款
        //     alert('请先同意条款和条件');
        // }
        onAgree();
        onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <CustomText style={styles.title} text={'服务协议和隐私政策'}/> 
          <ScrollView style={styles.scrollView}>
            <CustomText style={styles.content} text={'欢迎使用我们的服务。请阅读并同意下方协议:'}/> 
            <TouchableOpacity 
                onPress={() => {
                    onClose() 
                    callback()
                }}>
              <CustomText style={styles.link} text={'《FCM个人信息保护政策》'}/> 
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => {
                    onClose() 
                    callback2()
                }}>
              <CustomText style={styles.link} text={'《FCM服务协议》'}/> 
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => {
                    onClose() 
                    callback3()
                }}>
              <CustomText style={styles.link} text={'《FCM儿童个人信息保护政策及监护人须知》'}/> 
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => {
                    onClose() 
                    callback4()
                }}>
              <CustomText style={styles.link} text={'《个人信息跨境传输同意函》'}/> 
            </TouchableOpacity>
            {/* 可以添加更多条款 */}
          </ScrollView>
          {/* <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkbox} 
              onPress={() => setIsChecked(!isChecked)}
            >
              {isChecked && <View style={styles.checked} />}
            </TouchableOpacity>
            <Text>我已阅读并同意上述条款</Text>
          </View> */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <CustomText  style={styles.buttonText} text={'取消'}/> 
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.agreeButton]} 
              onPress={handleAgree}
            >
              <CustomText  style={styles.buttonText} text={'同意并登录'}/> 
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color:Theme.fontColor,
  },
  scrollView: {
    maxHeight: 200,
  },
  content: {
    marginBottom: 10,
  },
  link: {
    color: Theme.theme,
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    width: '45%',
    alignItems: 'center',
  },
  agreeButton: {
    backgroundColor: Theme.theme,
  },
  buttonText: {
    color: 'white',
  },
});

export default AgreementModal;
