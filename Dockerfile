FROM nginx as base

# - - -
# FRONTEND
FROM node:lts AS frontend

WORKDIR /noah

COPY ./package.json /noah/package.json
RUN yarn

COPY . /noah
RUN yarn build

# TO ONLY BUILD THE FRONTEND, USE --target frontend

# - - -
# BACKEND
FROM base AS backend

COPY nginx.conf /etc/nginx/conf.d/nginx.conf

# # Add the compiled frontend files
COPY --from=frontend /noah/dist /usr/share/nginx/html
