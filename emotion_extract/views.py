from django.shortcuts import render, HttpResponse, render_to_response
from emotion_extract.utils import returnJSON, GetRequestException
from emotion_extract.configuration import *
from image_emotion_server.settings import USE_MODEL
if USE_MODEL:
    from emotion_extract.ml_model import predict
import os
import requests


# Create your views here.
def index(request):
    return render(request, 'home.html')

def extract(request):
    try:
        if request.method != 'GET':
            raise GetRequestException("GET method is needed.")
        if request.GET.get("type") == "hash":
            print(request.GET)
            print(request.GET.get("value"))
            file_addr = os.path.join(IMAGE_CACHE, request.GET.get("value"))
        elif request.GET.get("type") == "url":
            import requests
            file_url = request.GET.get("value")
            try:
                r = requests.get(file_url, stream=True, timeout=10)
            except:
                raise GetRequestException("不合法的URL。")
            hash = hex(file_url.__hash__())[2:]
            file_addr = os.path.join(IMAGE_CACHE, hash)
            with open(file_addr, "wb") as img:
                for chunk in r.iter_content(chunk_size=1024):
                    if chunk:
                        img.write(chunk)
                img.close()

        try:
            result = predict(file_addr)
        except:
            raise GetRequestException("请正确指定一张图片。")
        print(result)
        return returnJSON({"success": True, "message": "", "result": result})


    except GetRequestException as e:
        return returnJSON({"success": False, "message": e.what})
    # except:
    #     return returnJSON({"success": False, "message": "Internal failure with extract. "})

def upload_image(request):
    return render(request, 'uploadImage.html')

def upload(request):
    try:
        if request.method != 'POST':
            raise GetRequestException("POST method is needed.")
        img = request.FILES.get("image", None).read()
        hash = hex(img.__hash__())[2:]
        destination = os.path.join(IMAGE_CACHE, hash)
        try:
            to_write = open(destination, "wb+")
        except:
            os.mkdir(IMAGE_CACHE)
            to_write = open(destination, "wb+")
        to_write.write(img)
        to_write.close()
        return returnJSON({"success": True, "message": "", "hash": hash})
    except GetRequestException as e:
        return returnJSON({"success": False, "message": e.what})

def about(request):
    return render(request, 'about.html')