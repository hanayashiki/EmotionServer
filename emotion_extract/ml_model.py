import emotion_extract.local as local
import sys
sys.path.append(local.PATH_TO_MODEL)
import single_predict
from test_module_resnet_no_top import getModel
import tensorflow as tf
import keras.backend.tensorflow_backend as KTF

KTF.set_session(tf.Session(config=tf.ConfigProto(device_count={'gpu': 0})))

model = getModel()
print("Loading model weights. ")
model.load_weights(local.WEIGHTS)
print("Weights loading complete. ")
graph = tf.get_default_graph()
def predict(img_address):
    global graph
    with graph.as_default():
        return single_predict.img_predict(model, img_address)[0].tolist()

if __name__ == '__main__':
    print(predict('C:/Users/Kiritsugu Emiya/Pictures/49209d036e946649da60a422df2f958b_r.png'))