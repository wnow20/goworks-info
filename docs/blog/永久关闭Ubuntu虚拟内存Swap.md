# 永久关闭Ubuntu虚拟内存Swap

Swap虚拟内存在Linux中是硬盘里的一块空间，被用做解决物理内存不够的情况，方式系统先OOM（内存溢出）这种不稳定的情况，但是在部署Kubernetes机器时，由于虚拟内存会导致容器运行时分配内存资源存在不确定性，因为虚拟内存毕竟是硬盘上的空间，性能无法保证。

# 如何永久关闭Swap虚拟内存

### 列出所有的虚拟内存文件


```shell
$ cat /proc/swaps
Filename		Type		Size	Used	Priority
/dev/dm-1       	partition	1003516	129996	-2
```

### 关闭虚拟内存


```shell
sudo swapoff -a
```

### 开启虚拟内存


```shell
sudo swapon -a
```

### 禁用Swap虚拟内存配置文件

注释掉 `/etc/fstab`文件中的swap实体


```shell
sudo sed -i '/swap/ s/^\(.*\)$/#\1/g' /etc/fstab
```

### 最终可以删除`/proc/swaps`列举的虚拟内存文件，比如：


```shell
sudo rm /dev/dm-1
```

本文翻译自：[https://www.shellhacks.com/disable-swap-permanently-ubuntu-linux/](https://www.shellhacks.com/disable-swap-permanently-ubuntu-linux/)

另外参考文档： [https://www.shellhacks.com/swappiness-in-linux-ubuntu-how-to-change/](https://www.shellhacks.com/swappiness-in-linux-ubuntu-how-to-change/)

