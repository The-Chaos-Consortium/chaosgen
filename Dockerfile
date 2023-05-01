FROM python:3.11-slim-bullseye
COPY . .
WORKDIR /
RUN pip install -r requirements.txt --disable-pip-version-check
CMD [ "python3", "-m", "chaosgen.bot" ]