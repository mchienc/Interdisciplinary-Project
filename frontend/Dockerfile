FROM node:20-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép mã nguồn frontend
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
