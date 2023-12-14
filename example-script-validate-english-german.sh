#!/bin/bash

LOG_DIR=./_local/test-logs/en-de
RESULTS_DIR=./_local/test-results/en-de
LOG_FILE_BASE=en-de
RESULTS_FILE_BASE=en-de
PAGE_SIZE=300
XSLX_FILE=./_local/xslx/en-de.xlsx
LANGUAGES="english,german"

SKIP1=0
SKIP2=300
SKIP3=600
SKIP4=900
SKIP5=1200
SKIP6=1500
SKIP7=1800
SKIP8=2100

CHUNK1=0-300
CHUNK2=300-600
CHUNK3=600-900
CHUNK4=900-1200
CHUNK5=1200-1500
CHUNK6=1500-1800
CHUNK7=1800-2100
CHUNK8=2100-2400

mkdir -p ${LOG_DIR}
mkdir -p ${RESULTS_DIR}

node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP1} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK1}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK1}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP2} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK2}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK2}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP3} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK3}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK3}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP4} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK4}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK4}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP5} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK5}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK5}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP6} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK6}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK6}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP7} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK7}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK7}.log 2>&1 &
node check-translation.js xslx ${XSLX_FILE} ${LANGUAGES} --skip=${SKIP8} --page-size=${PAGE_SIZE} --output=${RESULTS_DIR}/${RESULTS_FILE_BASE}_${CHUNK8}.json > ${LOG_DIR}/${RESULTS_FILE_BASE}_${CHUNK8}.log 2>&1 &

wait
