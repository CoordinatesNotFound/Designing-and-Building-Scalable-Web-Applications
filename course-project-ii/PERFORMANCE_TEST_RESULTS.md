# Performance test results

Brief description of the used server: HTTP/1.1 

Brief description of my computer: 
  Model Name:	MacBook Air
  Model Identifier:	Mac14,2
  Model Number:	Z15W0003HCH/A
  Chip:	Apple M2
  Total Number of Cores:	8 (4 performance and 4 efficiency)
  Memory:	16 GB
  System Firmware Version:	8422.141.2
  OS Loader Version:	8422.141.2
  Serial Number (system):	N7G7VNP6QD
  Hardware UUID:	E5D4D0B7-D785-5066-A815-5C849CA2ABBC
  Provisioning UDID:	00008112-000E18211407401E
  Activation Lock Status:	Enabled



## API: get courses


    execution: local
         script: performance-test-get-courses.js
         output: -
    
    scenarios: (100.00%) 1 scenario, 10 max VUs, 35s max duration (incl. graceful stop):
               * default: 10 looping VUs for 5s (gracefulStop: 30s)
    
    data_received..................: 4.4 MB 875 kB/s
     data_sent......................: 1.2 MB 239 kB/s
     http_req_blocked...............: med=1µs    p(99)=8µs    
     http_req_connecting............: med=0s     p(99)=0s     
     http_req_duration..............: med=2.99ms p(99)=12.49ms
       { expected_response:true }...: med=2.99ms p(99)=12.49ms
     http_req_failed................: 0.00%  ✓ 0           ✗ 13154
     http_req_receiving.............: med=10µs   p(99)=56µs   
     http_req_sending...............: med=2µs    p(99)=21.46µs
     http_req_tls_handshaking.......: med=0s     p(99)=0s     
     http_req_waiting...............: med=2.98ms p(99)=12.3ms 
     http_reqs......................: 13154  2628.783198/s
     iteration_duration.............: med=3.01ms p(99)=12.53ms
     iterations.....................: 13154  2628.783198/s
     vus............................: 10     min=10        max=10 
     vus_max........................: 10     min=10        max=10 



## API: get questions

    execution: local
         script: performance-test-get-questions.js
         output: -
    
    scenarios: (100.00%) 1 scenario, 10 max VUs, 35s max duration (incl. graceful stop):
               * default: 10 looping VUs for 5s (gracefulStop: 30s)
     
     data_received..................: 115 MB 23 MB/s
     data_sent......................: 1.4 MB 276 kB/s
     http_req_blocked...............: med=1µs    p(99)=8µs    
     http_req_connecting............: med=0s     p(99)=0s     
     http_req_duration..............: med=3.05ms p(99)=10.01ms
       { expected_response:true }...: med=3.05ms p(99)=10.01ms
     http_req_failed................: 0.00%  ✓ 0          ✗ 13404
     http_req_receiving.............: med=18µs   p(99)=191µs  
     http_req_sending...............: med=3µs    p(99)=28µs   
     http_req_tls_handshaking.......: med=0s     p(99)=0s     
     http_req_waiting...............: med=3.02ms p(99)=9.96ms 
     http_reqs......................: 13404  2676.99385/s
     iteration_duration.............: med=3.07ms p(99)=10.02ms
     iterations.....................: 13404  2676.99385/s
     vus............................: 10     min=10       max=10 
     vus_max........................: 10     min=10       max=10 



## API: post question


    execution: local
         script: performance-test-post-question.js
         output: -
    
    scenarios: (100.00%) 1 scenario, 10 max VUs, 35s max duration (incl. graceful stop):
               * default: 10 looping VUs for 5s (gracefulStop: 30s)
               
    data_received..................: 1.4 MB 275 kB/s
     data_sent......................: 693 kB 138 kB/s
     http_req_blocked...............: med=1µs     p(99)=13.31µs
     http_req_connecting............: med=0s      p(99)=0s     
     http_req_duration..............: med=11.4ms  p(99)=45.2ms 
       { expected_response:true }...: med=11.4ms  p(99)=45.2ms 
     http_req_failed................: 0.00%  ✓ 0          ✗ 3835
     http_req_receiving.............: med=17µs    p(99)=76.65µs
     http_req_sending...............: med=5µs     p(99)=33.65µs
     http_req_tls_handshaking.......: med=0s      p(99)=0s     
     http_req_waiting...............: med=11.37ms p(99)=45.19ms
     http_reqs......................: 3835   764.981825/s
     iteration_duration.............: med=11.44ms p(99)=45.26ms
     iterations.....................: 3835   764.981825/s
     vus............................: 10     min=10       max=10
     vus_max........................: 10     min=10       max=10



## API: get answers

    execution: local
         script: performance-test-get-answers.js
         output: -
    
    scenarios: (100.00%) 1 scenario, 10 max VUs, 35s max duration (incl. graceful stop):
               * default: 10 looping VUs for 5s (gracefulStop: 30s)
               
     data_received..................: 120 MB 24 MB/s
     data_sent......................: 1.4 MB 285 kB/s
     http_req_blocked...............: med=1µs    p(99)=9µs     
     http_req_connecting............: med=0s     p(99)=0s      
     http_req_duration..............: med=3.13ms p(99)=10.32ms 
       { expected_response:true }...: med=3.13ms p(99)=10.32ms 
     http_req_failed................: 0.00%  ✓ 0           ✗ 13854
     http_req_receiving.............: med=19µs   p(99)=183.46µs
     http_req_sending...............: med=3µs    p(99)=28µs    
     http_req_tls_handshaking.......: med=0s     p(99)=0s      
     http_req_waiting...............: med=3.1ms  p(99)=10.3ms  
     http_reqs......................: 13854  2769.993932/s
     iteration_duration.............: med=3.16ms p(99)=10.35ms 
     iterations.....................: 13854  2769.993932/s
     vus............................: 10     min=10        max=10 
     vus_max........................: 10     min=10        max=10 

## API: post answer

    execution: local
         script: performance-test-post-answer.js
         output: -
    
    scenarios: (100.00%) 1 scenario, 10 max VUs, 35s max duration (incl. graceful stop):
               * default: 10 looping VUs for 5s (gracefulStop: 30s)
     
     data_received..................: 1.2 MB 249 kB/s
     data_sent......................: 620 kB 124 kB/s
     http_req_blocked...............: med=1µs     p(99)=11µs   
     http_req_connecting............: med=0s      p(99)=0s     
     http_req_duration..............: med=12.6ms  p(99)=59.49ms
       { expected_response:true }...: med=12.6ms  p(99)=59.49ms
     http_req_failed................: 0.00%  ✓ 0          ✗ 3470
     http_req_receiving.............: med=18µs    p(99)=74µs   
     http_req_sending...............: med=5µs     p(99)=38µs   
     http_req_tls_handshaking.......: med=0s      p(99)=0s     
     http_req_waiting...............: med=12.57ms p(99)=59.46ms
     http_reqs......................: 3470   693.157952/s
     iteration_duration.............: med=12.64ms p(99)=59.53ms
     iterations.....................: 3470   693.157952/s
     vus............................: 10     min=10       max=10
     vus_max........................: 10     min=10       max=10