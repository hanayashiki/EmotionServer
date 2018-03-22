from django.shortcuts import render, HttpResponse, render_to_response
from emotion_extract.utils import returnJSON, GetRequestException
from emotion_extract.configuration import *
from emotion_extract.ml_model import predict
import os


# Create your views here.
def extract(request):
    try:
        if request.method != 'POST':
            raise GetRequestException("POST method is needed.")
        img = request.FILES.get("image", None).read()
        destination = os.path.join(IMAGE_CACHE, hex(img.__hash__())[2:])
        try:
            to_write = open(destination, "wb+")
        except:
            os.mkdir(IMAGE_CACHE)
            to_write = open(destination, "wb+")
        to_write.write(img)
        to_write.close()
        result = predict(destination)
        print(result)
        return returnJSON({"success": True, "message": "", "result": result})
    except GetRequestException as e:
        return returnJSON({"success": False, "message": e.what})
    # except:
    #     return returnJSON({"success": False, "message": "Internal failure with extract. "})

def upload_image(request):
    return render(request, 'uploadImage.html')