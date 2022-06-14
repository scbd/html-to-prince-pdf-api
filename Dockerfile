FROM node:18

# Install utilities
RUN apt-get update && apt-get install --assume-yes \
    wget \
    curl \
  && apt-get clean \
  && apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 fonts-wqy-zenhei \
      --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install PrinceXML
#https://www.princexml.com/download/prince-12.5-linux-generic-x86_64.tar.gz
ENV PRINCE=prince-20220520-linux-generic-x86_64
ENV PRINCE_TAR=$PRINCE.tar.gz
RUN wget http://www.princexml.com/download/$PRINCE_TAR \
  && tar -xzf $PRINCE_TAR \
  && rm $PRINCE_TAR \
  && cd $PRINCE \
  && ./install.sh \
  && cd .. \
  && rm -r $PRINCE
  

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install -q

COPY . ./

ENV PRINCE_BINARY "prince"

EXPOSE 7070

CMD ["node", "src/index.js" ]
