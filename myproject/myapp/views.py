from django.shortcuts import render
from django.http import FileResponse, JsonResponse
import os


# Create your views here.
def index(request):
    return render(request, "index.html")


def onboarding(request):
    file_path = "./myapp/templates/onboarding.pdf"
    response = FileResponse(open(file_path, "rb"), content_type="application/pdf")
    response["Content-Disposition"] = 'inline; filename="onboarding.pdf"'
    return response


def p4logo(request):
    file_path = "./myapp/templates/VisualP4_logo.png"
    response = FileResponse(open(file_path, "rb"), content_type="application/pdf")
    response["Content-Disposition"] = 'inline; filename="VisualP4_logo.png"'
    return response


def header_metadata_pagefile(request):
    try:
        file_list = []
        for file_name in os.listdir("./myapp/templates/HPD"):
            file_path = os.path.join("./myapp/templates/HPD", file_name)
            if os.path.isfile(file_path):
                with open(file_path, "r") as f:
                    file_list.append({file_name: f.read()})
        return JsonResponse({"files": file_list})
    except FileNotFoundError:
        return JsonResponse(
            {"error": "Directory not found", "current pwd": os.getcwd()}, status=404
        )


def action_metadata_pagefile(request):
    try:
        file_list = []
        for file_name in os.listdir("./myapp/templates/APD"):
            file_path = os.path.join("./myapp/templates/APD", file_name)
            if os.path.isfile(file_path) and file_name[-2:] == "p4":
                with open(file_path, "r") as f:
                    print(file_path)
                    file_list.append({file_name: f.read()})
        return JsonResponse({"files": file_list})
    except FileNotFoundError:
        return JsonResponse(
            {"error": "Directory not found", "current pwd": os.getcwd()}, status=404
        )
