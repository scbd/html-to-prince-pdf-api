FROM node:10.8.0

# Install utilities
RUN apt-get update && apt-get install --assume-yes \
    wget \
    curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install PrinceXML
#https://www.princexml.com/download/prince-12.1-linux-generic-x86_64.tar.gz
ENV PRINCE=prince-12.1-linux-generic-x86_64
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

EXPOSE 7070

CMD ["node", "src/index.js" ]
