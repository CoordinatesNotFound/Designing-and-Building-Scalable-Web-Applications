# Running steps

Note: The development environment of the application is MacOS, so the first line (base image) of some Dockerfile is different from walking skeleton



## Running with Docker Compose

Note: Since the flyway file contains many sqls, it may take quite a while for the database and flyway to be fully deployed and applied. After start up the application, please wait until it is ready.



### Running the application (development mode)

To start the application (development mode), open the terminal in the root of source code folder, then run `docker compose up`.



### Running the application (production mode)  

To start the application (production mode), open the terminal in the root of source code folder, then run `docker compose -f ./docker-compose.prod.yml up -d`.



### Shutting down the application

To shut down the application, press `Ctrl+C` in the same terminal.



### Running Playwrite tests

To run playwrite tests, open the terminal in the root of source code folder, then run `docker compose run --entrypoint=npx e2e-playwright playwright test && docker compose rm -sf`. (It may fail at the first time, please try again then)



## Running with Kubernetes



### Deploy and start the application



#### Step 1: Start the minikube cluster

run `minikube start`



#### Step 2: Prepare the images

Int the folder `/qa-api`
run `minikube image build -t qa-api -f ./Dockerfile .`

In the folder `/qa-ui`
run `minikube image build -t qa-ui -f ./Dockerfile .`

In the folder `/sse`
run `minikube image build -t sse -f ./Dockerfile .`

In the folder `/flyway`
run `minikube image build -t qa-api-database-migrations -f ./Dockerfile .`

In the folder `/llm-api`
run `minikube image build -t llm-api -f ./Dockerfile .`

run `minikube image list` to check the built images, and you can see the following:

```
docker.io/library/sse:latest
docker.io/library/qa-ui:latest
docker.io/library/qa-api:latest
docker.io/library/qa-api-database-migrations:latest
docker.io/library/llm:latest
```



#### Step 3: Deploy the database cluster

In the folder `/kubernetes`
run `kubectl apply -f qa-api-database-cluster.yaml`

run `kubectl get cluster` to check the status of database cluster:

```
NAME                      AGE   INSTANCES   READY   STATUS                     PRIMARY
qa-api-database-cluster   25s   2           2       Cluster in healthy state   qa-api-database-cluster-1
```

Note: the status of the cluster can be checked with the command `kubectl get cluster` -- setting the cluster up can take a while.


#### Step 4: Apply the database migrations

In the folder `/kubernetes`
run `kubectl apply -f qa-api-database-migration-job.yaml`

run `kubectl get pods` to check the migration job:
```
NAME                                  READY   STATUS      RESTARTS   AGE
qa-api-database-cluster-1             1/1     Running     0          18m
qa-api-database-cluster-2             1/1     Running     0          18m
qa-api-database-migration-job-r6mcl   0/1     Completed   0          30s
```



#### Step 5: Deploy the application

In the folder `/kubernetes`
run the following coomand:

```
kubectl apply -f mq.yaml
kubectl apply -f redis.yaml
kubectl apply -f llm-api.yaml
kubectl apply -f qa-api.yaml
kubectl apply -f sse.yaml
kubectl apply -f qa-ui.yaml
kubectl apply -f nginx.yaml
```

run `kubectl get services` to check the services:

```
NAME                          TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
kubernetes                    ClusterIP      10.96.0.1        <none>        443/TCP              9d
llm-api                       LoadBalancer   10.101.54.172    <pending>     7000:31111/TCP       35s
mq                            ClusterIP      10.106.79.118    <none>        5672/TCP,15672/TCP   44s
nginx-service                 LoadBalancer   10.106.46.126    <pending>     7800:31591/TCP       20s
qa-api                        LoadBalancer   10.103.228.224   <pending>     7777:30172/TCP       31s
qa-api-database-cluster-any   ClusterIP      10.96.48.206     <none>        5432/TCP             4m14s
qa-api-database-cluster-r     ClusterIP      10.97.43.195     <none>        5432/TCP             4m14s
qa-api-database-cluster-ro    ClusterIP      10.109.135.120   <none>        5432/TCP             4m14s
qa-api-database-cluster-rw    ClusterIP      10.102.204.202   <none>        5432/TCP             4m14s
qa-ui                         LoadBalancer   10.99.129.103    <pending>     3000:31320/TCP       23s
redis                         ClusterIP      10.106.101.118   <none>        6379/TCP             39s
```

run `kubectl get pods` to check the pods:

```NAME                                  READY   STATUS      RESTARTS   AGE
llm-api-deployment-75fd5885d9-2z4rw   1/1     Running     0          44s
mq-deployment-67d6b97c48-6n9h6        1/1     Running     0          53s
nginx-deployment-84d9bdb56f-scd5w     1/1     Running     0          29s
qa-api-database-cluster-1             1/1     Running     0          4m19s
qa-api-database-cluster-2             1/1     Running     0          4m2s
qa-api-database-migration-job-qdv2q   0/1     Completed   0          68s
qa-api-deployment-d9b57d966-5zcst     1/1     Running     0          40s
qa-ui-deployment-766c5fd79-qz86g      1/1     Running     0          32s
redis-deployment-6cff6445df-fqvgv     1/1     Running     0          49s
sse-deployment-547cfcc6d8-q4stc       1/1     Running     0          36s
```



#### Step 6: Access the application

run `minikube service nginx-service --url ` to check the service url, then open it in the browser;
or
run `kubectl port-forward svc/nginx-service 7800:7800`, then open http://localhost:7800 in the browser;



### Monitor the application



#### Step1: Deploy the Prometheus Operator

run `kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml`
or (if the command above fails)
run `kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml --force-conflicts=true --server-side=true`

In the folder `kubernetes/monitor`
run `kubectl apply -f prometheus_rbac.yaml`



#### Step2: Deploy Prometheus

In the folder `kubernetes/monitor`
run `kubectl apply -f prometheus_instance.yaml`

run `kubectl port-forward svc/prometheus-operated 9090:9090` and open http://localhost:9090 to see the Prometheus dashboard



#### Step3: Configuring Prometheus

In the folder `kubernetes/monitor`
run `kubectl apply -f service_monitor.yaml`



#### Step4: Deploy Grafana

In the folder `kubernetes/monitor`
run `kubectl create deployment grafana --image=docker.io/grafana/grafana:latest `

run `kubectl expose deployment grafana --port 3000`

run `kubectl port-forward svc/grafana 3000:3000`

Log in with`admin` as the username and password. Then, after reset your password, you will see the grafana ui.

In the folder `kubernetes/monitor`
run `kubectl apply -f expose_prometheus.yaml`
run `kubectl get nodes -o wide` to see the <node_ip>
use `http://<node_ip>:30900` to get Prometheus data source in grafana

Then create a dashboard to see the visualization.

> Reference: https://grafana.com/blog/2023/01/19/how-to-monitor-kubernetes-clusters-with-the-prometheus-operator/