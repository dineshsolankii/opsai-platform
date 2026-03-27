#!/bin/bash

# Stop all related processes
kill $(lsof -t -i:3000)
kill $(lsof -t -i:8000)
ps aux | grep celery | grep -v grep | awk '{print $2}' | xargs kill -9

echo "OpsAI has been stopped."
