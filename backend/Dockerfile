# استخدم صورة أساسية خفيفة جدًا
FROM alpine:latest

# حدد المجلد الذي سنعمل فيه داخل الخادم
WORKDIR /app

# قم بتحميل أحدث نسخة من PocketBase (نسخة لينكس) وفك ضغطها
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.29.2/pocketbase_0.29.2_linux_amd64.zip .
RUN unzip pocketbase_0.29.2_linux_amd64.zip

# هذا هو الأمر الذي سيتم تشغيله تلقائيًا عند بدء تشغيل الخادم
# لاحظ أنه نفس الأمر الذي حاولنا كتابته يدويًا
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb_data"]